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
        var table = $('#scoretable');
        table.empty()
        scores.forEach(function(score) {
            var row = $(document.createElement('tr'));
            /* Name */
            row.append(
                $('<td/>')
                    .addClass('name')
                    .css(style)
                    .css('background-color', config.bgcolor)
                    .text(score.name)
            );
            /* Scores */
            for (let idx = 0; idx < score.scores.length; idx++) {
                var scoreblock = $(document.createElement('td'));
                scoreblock.attr('class', 'score')
                scoreblock.append(
                    $('<div/>')
                        .addClass('decrement')
                        .css(style)
                        .css('background-color', config.bgcolor)
                        .hover(function() {
                            $(this).css("background-color", config.llcolor);
                        }, function() {
                            $(this).css("background-color", config.bgcolor);
                        })
                        .click(function() { socket.emit("score", {'command': 'decrement', 'id': score.id, 'idx': idx}); })
                );
                scoreblock.append(
                    $('<div/>')
                        .addClass('increment')
                        .css(style)
                        .css('background-color', config.bgcolor)
                        .hover(function() {
                            $(this).css("background-color", config.hlcolor);
                        }, function() {
                            $(this).css("background-color", config.bgcolor);
                        })
                        .click(function() { socket.emit("score", {'command': 'increment', 'id': score.id, 'idx': idx}) })
                );
                scoreblock.append(
                    $('<div/>')
                        .addClass('text')
                        .attr('id', score.id + idx.toString())
                        .css(style)
                        .text(score.scores[idx])
                );
                row.append(scoreblock);
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
            for (let idx = 0; idx < score.scores.length; idx++) {
                $("#" + score.id + idx.toString()).text(score.scores[idx].toString());
            }
        });

    });

    $('#reset').click(function(){
        socket.emit('score_reset');
    });
});
