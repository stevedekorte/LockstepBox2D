# Lockstep

Demo of lockstep networked multi-user simulation.

## Using the app

In this demo, multiple users can open a url to a Javascript demo where the user can click on browser window to add 2d boxes browser with simulated physics. If other users are currently using the app, each will see a colored mouse pointer for the other users and the state of the simulation (the balls bouncing around) will be kept in "lockstep" between them.

## How it works

Clients run the simulation in lockstep, share user inputs between clients via the relay server, and apply the inputs at the same time steps.

To do this, clients need to:
- ensure that they start with the same state (whenever a client joins the simulation) 

and on each synch step:
- agree on current set of clients
- have all inputs to be applied to the next step
- apply inputs in the same order

To minimize sync communications, the clients use their input message (called an ActionGroup) as their signal that they are ready to proceed to the next step. Each client shares it's action (after having processed changes to the user set and handling requests for the current state from new clients).

### Tricks

#### Smoother animation via multiple simTicks between syncTicks

To keep the simulation running at a high frame rate, a number of simulation steps (each doing a frame render) are carried out between each input syncing step. This ratio is currently fixed to a number which is reasonable for typical use cases, but could be dynamically optimized. In the code, the simulation steps are called "simTicks" and the synchronization points are called "syncTicks".

#### Avoid jitter by delaying user inputs

The current code applies the inputs taken between syncStep T and T+1 to the simulation at the start of T+2. Shifting the inputs allows more time for the inputs to arrive, which reduces the chance of having to pause the simualtion (producing noticeable jitter) while waiting on inputs, though at the cost of some (typically less noticeable) input lag. 

#### Don't sync non simultation things

The mouse position of the local user is shared periodically (if it's changed) with other users. As this doesn't effect the simulation itself, it doesn't need to be synchronized with it.

#### Verify syncs

To ensure client states are in sync, a hash of the state of the simulation is shared with the user inputs message and verified that it matches that of the receiver when applied.


## Implementation notes

#### Transparent Distributed Objects

The communications with the relay server are done using WebSockets, and with a transparent distributed objects library I wrote to use in this project. It deserves it's own documentation, but I haven't written it up yet. Some features include the ability to pass references to local objects which are automatically represented as DistantObject (transparent) proxies on the other side. This works between objects on the relay server and clients, as well as between the clients themselves via the messages relayed by the server. Another feature is that remote messages immediately return a DOFuture instance whose value is set after the response message is received, and which supports result, timeout, and error delegate messages. 


## How to develop and run locally

This demo project was written using the VSCode IDE and has launch scripts (the the .vscode folder)
that make developing/debugging it in VSCode convenient. 

To use it, you need to:
- run webserver to serve the files for the web client
- run a node.js server to host the WebSockets server
- open a web browser with the URL to the webserver page for the client

### Running a web server locally

Open a terminal, move to the project folder and run:

    node local-web-server/main.js

### Running the node websockets server locally

Open a terminal, move to the project folder and run:

    node server/main.js

Or to run in the VSCode debugger:

-  click the "Run & Debug" button 
    (it's on the left side of the VSCode window with a arrow+bug icon)
- select the "node: websocket server" from the "RUN AND DEBUG" pull down menu on the top
    left of the window
- click the run button (the right arrow icon button to the left of the pull down menu)
- select the "DEBUG CONSOLE" tab in the debugger pane, to see the output

### Launching the client to use the local server

Open a web browser to the URL:

    https://localhost:9000/index.html

Or to run in the client in the VSCode debugger:

-  click the "Run & Debug" button 
    (it's on the left side of the VSCode window with a arrow+bug icon)
- select the "chrome: open client page" from the "RUN AND DEBUG" pull down menu on the top
    left of the window
- click the run button (the right arrow icon button to the left of the pull down menu)
- select the "DEBUG CONSOLE" tab in the debugger pane, to see the output

### Notes on VSCode

I've found it difficult to debug both the client and server in VSCode at the same time, 
so I usually only debug one at a time and run the other externally 
(the client in a browser, or the server from a terminal). 

