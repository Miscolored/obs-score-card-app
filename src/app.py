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
    return {'scores': tuple([vars(score) for score in scores])}

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
    app.logger.info(str(rgbhex))
    rgbfloat = list(map(lambda x: int(x, 16) / 255, rgbhex))
    hls = list(colorsys.rgb_to_hls(rgbfloat[0], rgbfloat[1], rgbfloat[2]))
    hls[1] = min(1, max(hls[0] * 1.25, hls[0] + 0.15))
    rgbfloat = colorsys.hls_to_rgb(hls[0], hls[1], hls[2])
    return list(map(lambda x: hex(ceil(255 * x))[2:], rgbfloat))

def get_lowlight_color(rgbhex):
    app.logger.info(str(rgbhex))
    rgbfloat = list(map(lambda x: int(x, 16) / 255, rgbhex))
    hls = list(colorsys.rgb_to_hls(rgbfloat[0], rgbfloat[1], rgbfloat[2]))
    hls[1] = max(0, min(hls[0] * 0.75, hls[0] - 0.15))
    rgbfloat = colorsys.hls_to_rgb(hls[0], hls[1], hls[2])
    return list(map(lambda x: hex(ceil(255 * x))[2:], rgbfloat))


def convert_colors(bg, fg):
    bgcolor = color_uint32_to_rgbhex(int(bg))
    return {
        'fgcolor': "#" + "".join(color_uint32_to_rgbhex(int(fg))),
        'bgcolor': "#" + "".join(bgcolor),
        'hlcolor': "#" + "".join(get_highlight_color(bgcolor)),
        'llcolor': "#" + "".join(get_lowlight_color(bgcolor))
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

def setup():
    handler = RotatingFileHandler('score-card.log', maxBytes=10000, backupCount=1)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    config = None
    with open('./config/browser_source.json') as f:
        config = json.load(f)
    global scores, font, color
    
    score_count = config['score_count']
    scores = tuple([Score(score['value'], score_count) for score in config['score_names']])
    if 'font' in config.keys():
        font = convert_font(config['font'])
    if 'bgcolor' in config.keys() and 'fgcolor' in config.keys():
        color = convert_colors(config['bgcolor'], config['fgcolor'])


@app.route('/')
def menu():
    return render_template('menu.html')

### SCORE CARD
def score_emit():
    socketio.emit('score_update', json.dumps(make_scores_dict()))

@app.route('/score-card')
def score_card():
    return render_template('scores.html')

@socketio.on('score_client_connected')
def score_card_connect(message):
    setup = make_scores_dict()
    setup.update(make_config_dict())
    socketio.emit('score_setup', json.dumps({'setup': setup}))

@socketio.on('score')
def score(data):
    id = data['id']
    i = data['idx']
    for idx in range(len(scores)):
        if scores[idx].id == data["id"]:
            if data['command'] == "increment":
                scores[idx].increment_number(i)
            if data['command'] == "decrement":
                scores[idx].decrement_number(i)
    app.logger.info(data)
    score_emit()

@socketio.on('score_reset')
def reset():
    app.logger.info("SCORE_CARD: received reset")
    for idx in range(len(scores)):
        scores[idx].reset()
    score_emit()

### STOPWATCH
def stopwatch_emit(button):
    socketio.emit('stopwatch_update', json.dumps({'button': button}))

@app.route('/stopwatch')
def stopwatch():
    return render_template('stopwatch.html')

@socketio.on('stopwatch_client_connected')
def score_card_connect(message):
    socketio.emit('stopwatch_setup', json.dumps({'setup': make_config_dict()}))

@socketio.on('stopwatch_button')
def stopwatch_button(data):
    app.logger.info(data["button"])
    return stopwatch_emit(data["button"])

if __name__ == '__main__':
    setup()
    app.run(debug=False, host='0.0.0.0')
    app.add_url_rule('/favicon.ico',  redirect_to=url_for('static', filename='favicon.ico'))
