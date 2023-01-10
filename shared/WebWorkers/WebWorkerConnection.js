"use strict";

/*

    WebWorkerConnection

    Manages basic WebWorker messages connection and related events

    Delegte methods:

    - onConnectionClose(this)
    - onConnectionError(this, error)
    - onConnectionMessage(this, data)

*/


getGlobalThis().onmessage = function (event) {
    WebWorkerConnection.shared().onmessage(event)
}

(class WebWorkerConnection extends Base {

    initPrototype () {
        this.newSlot("error", null)
        this.newSlot("delegate", null)
        this.newSlot("webWorker", null)
        this.newSlot("name", null)
    }

    init () {
        super.init()
        this.setIsDebugging(true)
    }

    launchContainer () {
        const options = { name: this.name() }
        const worker = new Worker('WorkerContainer.js', options);

        worker.onmessage = (event) => {
            this.onMessage(event.data)
        }

        worker.onmessageerror = (event) => {
            this.onError(event)
        }

        worker.onerror = (event) => {
            this.onError(event)
        }

        this.setWebWorker(worker)

        return this
    }

    shutdown () {
        this.debugLog(" shutdown")
        this.webWorker().terminate()
        this.setWebWorker(null)
    }

    isOpen () {
        const ws = this.webSocket()
        return ws && ws.isOpen()
    }

    // --- websocket events API ---

    onOpen () {
        this.debugLog(" onOpen()")
        // don't need open delegate message as there is an open delegate message sent by server?
    }

    /*
    onConnect () {
        this.debugLog(" onConnect()")
    }
    */

    onClose (code, reason) {
        // code 1006 can mean INVALID CERT 
        if (code === 1006) {
            console.log(this.type() + " onClose() ERROR: INVALID CERT")
        }
        this.debugLog(" onClose(code: " + code + ", reason:" + reason + ")")

        const d = this.delegate()
        if (d && d.onConnectionClose) {
            d.onConnectionClose(this)
        }

        this.shutdown(this);
    }

    onError (event) {
        // event appears to be of type "Event", not ErrorEvent, so it has no message - odd!
        this.debugLog(" onError(event) ", event)
        this.setError(event.message)
        this.shutdown()

        const d = this.delegate()
        if (d && d.onConnectionError) {
            d.onConnectionError(this, event.message)
        }
    }

    onMessage (data) {
        //this.debugLog(" onMessage(" + data.toString() + ")");

        const d = this.delegate()
        if (d && d.onConnectionMessage) {
            d.onConnectionMessage(this, data)
        }
    }

    send (data) {
        this.webWorker().postMessage(data)
        //postMessage(data, []);
        //postMessage(jsonData, [jsonData])
    }

}.initThisClass());



