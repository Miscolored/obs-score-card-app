import colorsys, configparser, json
from flask import Flask, render_template, redirect, url_for
from flask_socketio import SocketIO
from math import ceil
from score import Score


import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)
socketio = SocketIO(app)

scores = []
font = {}
color = {}

def make_scores_dict():
    j = tuple([vars(score) for score in scores])
    return {'scores': j}

def make_config_dict():
    config = {}
    config.update(font)
    config.update(color)
    return {'config': config}

def color_uint32_to_rgbhex(coloruint32):
    hex32 = hex(coloruint32)
    # silly OBS color scheme
    r = hex32[8:]
    g = hex32[6:8]
    b = hex32[4:6]
    return [r, g, b]

def get_highlight_color(rgbhex):
    app.logger.error(str(rgbhex))
    rgbfloat = list(map(lambda x: int(x, 16) / 255, rgbhex))
    hls = list(colorsys.rgb_to_hls(rgbfloat[0], rgbfloat[1], rgbfloat[2]))
    hls[0] = min(1, max(hls[0] * 1.25, hls[0] + 0.15))
    rgbfloat = colorsys.hls_to_rgb(hls[0], hls[1], hls[2])
    return list(map(lambda x: hex(ceil(255 * x))[2:], rgbfloat))

def convert_colors(colorsobs):
    bgcolor = color_uint32_to_rgbhex(int(colorsobs['bgcolor']))
    hlcolor = "#" + "".join(get_highlight_color(bgcolor))
    bgcolor = "#" + "".join(bgcolor)
    return {
        'fgcolor': "#" + "".join(color_uint32_to_rgbhex(int(colorsobs['fgcolor']))),
        'bgcolor': bgcolor,
        'hlcolor': hlcolor
    }

def convert_font(fontobs):
    return {
        'family': fontobs['face'],
        'style': fontobs['style'],
        'size': int(fontobs['size']),
        'bold': int(fontobs['flags']) & 1,
        'italic': int(fontobs['flags']) & 2,
        'underline': int(fontobs['flags']) & 4,
        'strikethrough': int(fontobs['flags']) & 8
    }

def scoreemit():
    socketio.emit('update', json.dumps(make_scores_dict()))

@app.route('/')
def menu():
    return redirect(url_for('score_card'))

@app.route('/score-card')
def score_card():
    return render_template('scores.html')

@socketio.on('client_connected')
def score_card_connect(message):
    setup = make_scores_dict()
    setup.update(make_config_dict())
    socketio.emit('setup', json.dumps({'setup': setup}))

@socketio.on('win')
def increment_win(data):
    app.logger.error("SCORE_CARD: received win from " + str(data))
    for idx in range(len(scores)):
        if scores[idx].id == data["id"]:
            scores[idx].increment_win()
    scoreemit()

@socketio.on('loss')
def increment_loss(data):
    app.logger.error("SCORE_CARD: received loss from " + str(data))
    for idx in range(len(scores)):
        if scores[idx].id == data["id"]:
            scores[idx].increment_loss()
    scoreemit()

@socketio.on('reset')
def reset():
    app.logger.error("SCORE_CARD: received reset")
    for idx in range(len(scores)):
        scores[idx].reset()
    scoreemit()

def setup():
    handler = RotatingFileHandler('score-card.log', maxBytes=10000, backupCount=1)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)

    config = configparser.ConfigParser(allow_no_value=True, default_section='DEFAULT')
    config.optionxform = str
    config.read('./config/browser_source.ini')
    global scores, font, color
    scores = tuple([Score(name = score) for score in config['NAMES'].keys()])
    font = convert_font(config['FONT'])
    color = convert_colors(config['COLOR'])

if __name__ == '__main__':
    setup()
    app.run(debug=False, host='0.0.0.0')
