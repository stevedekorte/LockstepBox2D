
"use strict";

/*
    WebWorkerManager

    Delegte methods:
    - onConnectionOpen(aConnection)
    - onConnectionClose(aConnection)
*/

// ---------

const WebSocket = require('ws');
require("../Base/getGlobalThis.js");
require("../Base/Base.js");

(class WebWorkerManager extends Base {

    initPrototype () {
        this.newSlot("connections", null);
        this.newSlot("delegate", false);
        //this.newSlot("connectionClass", WsConnection);
    }

    init () {
        super.init()
        this.setConnections(new Set())
    }

    start () {

    }

    newWorker () {
        const worker = new Worker('WorkerContainer.js');
        const conn = WebWorkerConnection.clone()

        worker.onmessage = (event) => {
            // message from worker
        }

        //worker.postMessage(data)
    }

    onConnection (conn) {
        // for subclasses to override
        if (this.delegate()) {
            this.delegate().onConnectionOpen(conn)
        }
    }

    onConnectionClose (conn) { // sent by DOConnection to us as it's delegate
        this.debugLog(".onConnectionClose()")
        this.connections().delete(conn)
        if (this.delegate()) {
            this.delegate().onConnectionClose(conn)
        }
    }

}.initThisClass());

// -------------------



