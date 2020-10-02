$(document).ready(function(){
    //connect to the socket server.
    var socket = io()
    socket.on('connect', function() {
        socket.emit('client_connected', {data: 'connected'});

    });

    //recieve first connection from server
    socket.on('stopwatch_setup', function(msg) {
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
    });

    var resumeStopwatchButton = document.querySelector('#resumeStopwatch');
    var pauseStopwatchButton = document.querySelector('#pauseStopwatch');
    var stopwatchDisplay = document.querySelector('#stopwatch');
    var startTime;
    var updatedTime;
    var difference;
    var tInterval;
    var savedTime;
    var paused = 0;
    var running = 0;
    
    
    function getShowTime(){
        updatedTime = new Date().getTime();
        if (savedTime){
            difference = (updatedTime - startTime) + savedTime;
        } else {
            difference =  updatedTime - startTime;
        }
        
        // var days = Math.floor(difference / (1000 * 60 * 60 * 24));
        var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((difference % (1000 * 60)) / 1000);
        var milliseconds = Math.floor((difference % (1000 * 60)) / 100);
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        milliseconds = (milliseconds < 100) ? (milliseconds < 10) ? "00" + milliseconds : "0" + milliseconds : milliseconds;
        stopwatchDisplay.innerHTML = hours + ':' + minutes + ':' + seconds + ':' + milliseconds;
    }
    
    function resumeStopwatch(){
        if(!running){
        startTime = new Date().getTime();
        tInterval = setInterval(getShowTime, 10);
        // change 1 to 1000 above to run script every second instead of every millisecond. one other change will be needed in the getShowTime() function below for this to work. see comment there.   
    
        paused = 0;
        running = 1;
        stopwatchDisplay.style.background = "#FF0000";
        stopwatchDisplay.style.cursor = "auto";
        stopwatchDisplay.style.color = "yellow";
        resumeStopwatchButton.classList.add('lighter');
        pauseStopwatchButton.classList.remove('lighter');
        resumeStopwatchButton.style.cursor = "auto";
        pauseStopwatchButton.style.cursor = "pointer";
        }
    }

    function pauseStopwatch(){
        if (!difference){
            // if stopwatch never started, don't allow pause button to do anything
        } else if (!paused) {
            clearInterval(tInterval);
            savedTime = difference;
            paused = 1;
            running = 0;
            stopwatchDisplay.style.background = "#A90000";
            stopwatchDisplay.style.color = "#690000";
            stopwatchDisplay.style.cursor = "pointer";
            resumeStopwatchButton.classList.remove('lighter');
            pauseStopwatchButton.classList.add('lighter');
            resumeStopwatchButton.style.cursor = "pointer";
            pauseStopwatchButton.style.cursor = "auto";
        } else {
            // if the stopwatch was already paused, when they click pause again, start the stopwatch again
            resumeStopwatch();
        }
    }

    function resetStopwatch(){
        clearInterval(tInterval);
        savedTime = 0;
        difference = 0;
        paused = 0;
        running = 0;
        stopwatchDisplay.innerHTML = 'Start Stopwatch!';
        stopwatchDisplay.style.background = "#A90000";
        stopwatchDisplay.style.color = "#fff";
        stopwatchDisplay.style.cursor = "pointer";
        resumeStopwatchButton.classList.remove('lighter');
        pauseStopwatchButton.classList.remove('lighter');
        resumeStopwatchButton.style.cursor = "pointer";
        pauseStopwatchButton.style.cursor = "auto";
    }

    $('#stopwatch').click(function(){
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


