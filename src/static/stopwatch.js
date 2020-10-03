$(document).ready(function(){

    var config;
    var style;

    //connect to the socket server.
    var socket = io()
    socket.on('connect', function() {
        socket.emit('stopwatch_client_connected', {data: 'connected'});

    });

    //recieve first connection from server
    socket.on('stopwatch_setup', function(msg) {
        config = JSON.parse(msg).setup.config;
        style = {}
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

        $('.stopwatchButton')
            .css(style)
            .css('background-color', config.bgcolor)
            .hover(function() {
                $(this).css("background-color", config.hlcolor);
            }, function() {
                $(this).css("background-color", config.bgcolor);
            });

        $('#stopwatch')
            .css(style)
            .css('background-color', config.bgcolor)
            .hover(function() {
                $(this).css("background-color", config.hlcolor);
            }, function() {
                $(this).css("background-color", config.bgcolor);
            })
            .click(function(){
                socket.emit('stopwatch_button', {button: 'resume'});
            });
        
        $('#resumeStopwatch').click(function(){
            socket.emit('stopwatch_button', {button: 'resume'});
        });
    
        $('#pauseStopwatch').click(function(){
            socket.emit('stopwatch_button', {button: 'pause'});
        });
    
        $('#resetStopwatch').click(function(){
            socket.emit('stopwatch_button', {button: 'reset'});
        });
    });

    var timer= {
        "startTime": 0,
        "difference": 0,
        "tInterval": 0,
        "savedTime": 0,
        "paused": 1,
        "running": 0
    }
    
    
    function getShowTime(){
        let updatedTime = new Date().getTime();
        if (timer.savedTime){
            timer.difference = (updatedTime - timer.startTime) + timer.savedTime;
        } else {
            timer.difference =  updatedTime - timer.startTime;
        }
        var hours = Math.floor((timer.difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((timer.difference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timer.difference % (1000 * 60)) / 1000);
        let tenths = Math.floor(timer.difference % 1000 / 100);
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        $('#stopwatch').text(hours + ':' + minutes + ':' + seconds + '.' + tenths);
    }
    
    function resumeStopwatch(){
        if(!timer.running){
            timer.startTime = new Date().getTime();
            timer.tInterval = setInterval(getShowTime, 100);
            timer.paused = 0;
            timer.running = 1;

        }
    }

    function pauseStopwatch(){
        if (!timer.paused && timer.difference) {
            clearInterval(timer.tInterval);
            timer.savedTime = timer.difference;
            timer.paused = 1;
            timer.running = 0;
        }
    }

    function resetStopwatch(){
        clearInterval(timer.tInterval);
        timer.savedTime = 0;
        timer.difference = 0;
        timer.paused = 0;
        timer.running = 0;
        $('#stopwatch').text('Start Stopwatch!');
    }

    //receive update from server
    socket.on('stopwatch_update', function(msg) {
        let button = JSON.parse(msg).button;
        switch(button) {
            case "pause":
                pauseStopwatch();
                break;
            case "resume":
                resumeStopwatch();
                break;
            case "reset":
                resetStopwatch();
                break;
            default:
                break;
        }
    });
});


