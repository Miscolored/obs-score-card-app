$(document).ready(function(){
    //connect to the socket server.
    var socket = io()
    socket.on('connect', function() {
        socket.emit('score_client_connected', {data: 'connected'});

    });

    //recieve first connection from server
    socket.on('score_setup', function(msg) {
        let config = JSON.parse(msg).setup.config;
        let style = {}
        style['color'] = config.fgcolor
        style['font-family'] = config.family
        style['font-size'] = config.size + 'px'
        if (config.bold) {
            style['font-weight'] = 'bold'
        }
        if (config.italic) {
            style['font-style'] = ' italic'
        }
        if (config.underline) {
            style['text-decoration-line'] = 'underline'
        }
        if (config.strikethrough) {
            style['text-decoration-line'] += ' line-through'
        }


        let scores = JSON.parse(msg).setup.scores;
        console.log(scores);
        var table = $('<table/>');
        scores.forEach(function(score) {
            var row = $('<tr/>');
            for (let field in score) {
                if (field == 'id') {
                    continue;
                }
                row.append(
                    $('<td/>')
                    .attr("id", score.id + field)
                    .css(style)
                    .css('background-color', config.bgcolor)
                    .hover(function() {
                        if ( field != 'name') {
                            $(this).css("background-color", config.hlcolor);
                        }
                    }, function() {
                        $(this).css("background-color", config.bgcolor);
                    })
                    .text(score[field])
                    .click(function() { socket.emit(field, {'id': score.id}); })
                    )
                }
                table.append(row);
            });
            
        $('#table').html("");
        $('#table').html(table);
    });

    //receive update from server
    socket.on('score_update', function(msg) {
        let scores = JSON.parse(msg).scores;
        scores.forEach(function(score) {
            for (let field in score) {
                switch(field) {
                    case "name":
                    case "id":
                        break;
                    default:
                        $("#" + score.id + field).text(score[field].toString());
                }
            }
        });

    });

    $('#reset').click(function(){
        socket.emit('score_reset');
    });
});
