A full-on OBS custom browser overlay script.

The script deploys a local containerized Flask webapp that provides a number of customizable views suitable for use as browser overlays within OBS or other streaming tool. 
* shows wins/losses for customizable team names (i.e. crew/impostor, cops/robbers, etc.)
* stopwatch with pause and reset

You can update these views for your viewers in real time using any android, iphone, computer, or tablet on the OBS-computer network, or from your stream tool's custom browser dock.

![Score Card Browser Source Screenshot](https://raw.githubusercontent.com/Miscolored/obs-browser-source/main/img/screenshot.PNG)


# Usage
1. Once deployed, the script launches a containerized webapp that hosts the views and their controls
1. Use a web browser to increment or reset scores based on your wins/losses in all kinds of games, like Among Us, CSGO, etc. or to pause and restart a stopwatch.

# Install/Deploy
## Prerequisites
1. Windows 10 (tested on 1909 build 18363.1082, Linux/MacOS users should be fine with similar prereqs))
1. Python 3.6 (tested on 3.6.7)
1. Docker (tested on 19.03.12)
1. OBS (tested on OBS Studio 25.0.8+)

## Start the bowser source plugin
1. Clone or download the contents of this repo
1. Open OBS Tools>Scripts>
1. On the Python Settings tab, ensure you have a Python 3.6 selected (OBS limitation)
1. On the Scripts tab select +
1. Select obs-browser-source.py
1. Add Scores To Track appropriate for your game (i.e. crew, impostor or cops, robbers)
1. Select Fonts, and Colors (note the Score Font options are your system fonts, and may not render as expected across devices (including your OBS browser source))
1. Click Deploy Browser Source Server
1. Docker.exe popups may be visible for a second while the image is built and container started)

# Score Card
## Adding the scorecard as an overlay in OBS
1. Once deployed, create a new browser source with the following information
  * Local file, Use customer frame rate, Control audio via OBS, Shutdown source when not visible: uncheck
  * Refresh browser when scene becomes active: check
  * URL:  http://localhost/5000/score-card
  * Width: depends on your game, font, score names, and stream resolution (400 is a good starting point)
  * Height: depends on your game, font, number of scores, and stream resolution (175 is a good starting point) (crop out the Reset button from the view)
  * Click Refresh cache of current page
1. The score card is now available as a browser source to be added to your OBS scenes

## Updating the scores
You can view and update the score card from any browser.

### Viewing inside OBS as a Custom Browser Dock
1. In OBS click View>Docker>Custom Browser Docks
1. Give the dock a name and enter http://localhost:5000/score-card/ to the URL

### Viewing the app locally (on OBS host)
1. Browser to http://localhost:5000/score-card/
1. Click the win and loss cells to update the scores

### Viewing the app on another device (ios, android, laptop, etc)
1. Ensure the devices are connected to the same network
1. Obtain the _internal network_ IP address of OBS host (typically start with 172 or 192) (use ifconfig, ipconfig, ipaddr depending on host OS, or google)
1. On the other device, browse to http://<OBS HOST IP>:5000/score-card

## Shutting down and cleaning up
1. From OBS Scripts window, select score-card-obs-script.py
1. Click Remove Score Card Server (this will delete the container and image created during deployment)
1. Docker.exe command windows may pop up for a second while docker tears down the container and removes the image.

# Stopwatch
To use the Stopwatch feature, follow the steps for Score Card, but replace score-card in the URL with stopwatch.

# Logs
The plugin writes some log information to the OBS log, which can be accessed through OBS via Help>Log Files>View Current Log
The app writes some log information to a logfile on the container called score-card.log, which can be accessed through `docker exec -it browser-source cat obs-browser-source.log`

# Troubleshooting
**Host not found or 404 errors when accessing score-card app (local)**
1. Check if the docker container is running, from command line type `docker ps` and ensure score-card is running
1. Check that you have added the port number to the URL (5000 is default for the app)

**Scores not updated when clicked**
1. The webapp uses javascript, sockets, and jquery. It is possible your browser settings are blocking some of this functionality.
1. The score-card container my have been terminated.

# Bugs and Features
Open an issue if you'd like me to add a feature or fix a bug.
Open a PR if you've added or fixed something, or just fork.

# Feature Roadmap Ideas and TODOs
Features requests should be captured as issues on the project's repository at [https://github.com/Miscolored/obs-browser-source]