"use strict";

/*
    
    User

*/

(class User extends Serializable {
    initPrototype () {
        this.newSlot("simApp", null)
        this.newSlot("client", null)
        this.newSlot("userPointer", null)
        this.newSlot("actions", null)
        this.newSlot("actionGroup", null)
        this.newSerializableSlot("id", "?") 
        this.newSlot("actionGroups", null)
        this.newSlot("joinedAtSyncTick", 0) // so we know when it's possible to have input (can't have input prior to joining)
        this.newSlot("hasState", false) // so we know when we can start sending it actions
    }

    init () {
        super.init()
        this.setActions([])
        this.setUserPointer(UserPointer.clone().setDelegate(this).setUser(this))
        this.setActionGroups(new Map())
    }

    isLocal () {
        return this.simApp().localUser() === this
    }

    shortId () {
        const s = this.id()
        const short = s.slice(s.length - 3)
        const tag = this.isLocal() ? "local__" : "remote_"
        return tag + "u" + short
    }

    getName () {
        return this.id().split("_")[1].substring(0, 3)
    }

    setClient (aClient) {
        this._client = aClient
        this.setId(aClient.distantObjectForProxy().remoteId())

        this.userPointer().view().setName(this.getName())
        return this
    }

    shortDescription () {
        return this.type() + "_" + this.id()
    }

    addAction (anAction) {
        this.actions().push(anAction)
        return this
    }

    // --- actions groups ---

    
    deleteOldActionGroups () {
        const t = this.simApp().syncTick() - this.simApp().actionOffset() - 2
        const ags = this.actionGroups()
        const ag = ags.get(t)
        if (ag) {
            //this.debugLog("-- deleted " + ag.shortId() + " ")
            this.actionGroups().delete(t)
        }
    }
    
    /*
    deleteOldActionGroups () {
        const old = this.simApp().syncTick() - this.simApp().actionOffset() - 1
        const map = this.actionGroups()
        Array.from(map.keys()).forEach(key => {
            if (key < old) {
                map.delete(key)
            }
        })
    }
    */

    actionGroupForTick (tick) {
        return this.actionGroups().get(tick)
    }

    prepareActionGroup () {
        const t = this.simApp().syncTick()
        if (!this.actionGroups().has(t)) {
            const hash = this.simApp().currentSimHash()
            const ag = ActionGroup.clone()
            ag.setClientId(this.id())
            ag.setSyncTick(t)
            ag.setHash(hash)
            ag.setActions(this.actions())
            this.setActions([])
            this.receiveActionGroup(ag)
        } else {
            debugger;
        }
    }

    currentSendActionGroup () {
        const t = this.simApp().syncTick()
        return this.actionGroupForTick(t)
    }

    sendActionGroup () {
        //  We send T action group but will apply (T - actionOffset) actionGroup
        const t = this.simApp().syncTick()
        assert(this.actionGroups().has(t)) // prepareActionGroup should have already been called at start of onSyncTick
        //this.prepareActionGroup()
        const ag = this.actionGroups().get(t)
        if (this.simApp().users().length > 1) {
            this.debugLog(">> SENDING " + ag.shortId())
        }
        const rm = RemoteMessage.creationProxy().addActionGroup(ag)
        this.simApp().channel().asyncRelayMessageFrom(rm, this.client()) //.ignoreResponse()

        assert(this.actionGroups().has(t))
    }

    /*
    sendActionGroupToUserOnSyncTick (user, syncTick) {
        const ag = this.actionGroups().get(syncTick)
        assert(ag)
        const rm = RemoteMessage.creationProxy().addActionGroup(ag)
        user.client().distantObjectForProxy().asyncReceiveMessage(rm)
    }
    */

    receiveActionGroup (ag) {
        if (!this.isLocal()) {
            this.debugLog("<< RECEIVED " + ag.shortId() + " :: " + this.summary())
        }
        const t = ag.syncTick()
        //assert(!this.actionGroups().has(t)) // it might have it after setState
        if (this.actionGroups().has(t)) {
      //      debugger;
        }
        this.actionGroups().set(t, ag)
        //this.debugLog(this.summary())
        return this
    }

    onNewUserStateRequest (user) {
        // have to be carefull - if we add user before preparing current action group, it won't get sent?
        this.debugLog(".onNewUser(" + user.shortId() + ")")
        // send any action groups we have
        //this.debugLog("sending " + this.actionGroups().size + " ag")
        this.actionGroups().forEach(ag => {
            this.debugLog("   >> sending " + ag.shortId() + " to " + user.shortId())
            const rm = RemoteMessage.creationProxy().addActionGroup(ag)
            const future = user.client().asyncReceiveMessage(rm)
            future.setResponseTarget(this)
            //this.debugLog("future: ", future)
        })
        this.sharePosition()
    }

    onComplete_addActionGroup (future) {
        debugger
    }

    onError_addActionGroup (future) {
        debugger

    }

    onTimeout_addActionGroup (future) {
        debugger
    }

    hasActionGroup () {
        return this.currentApplyActionGroup() !== undefined
    }

    currentApplySyncTick () {
        return this.simApp().currentApplySyncTick()
    }

    currentApplyActionGroup () {
        return this.actionGroupForTick(this.currentApplySyncTick())
    }

    canHaveActionGroup () {
        if (!this.hasState()) {
            return false
        }

        if (this.simApp().syncTick() >= this.firstAppliableSyncTick()) {
            return true
        }
        return false
    }

    firstAppliableSyncTick () {
        return this.joinedAtSyncTick() + this.simApp().actionOffset() + 1
    }

    /*
    canHaveLocalUserActionGroup () {
        if (this.simApp().syncTick() >= this.simApp().localUser().joinedAtSyncTick() + this.simApp().actionOffset() + 1) {
            return true
        }
        return false
    }
    */

    applyActionGroup () {
        if (!this.simApp().isRunning()) {
            return
        }

        if (!this.canHaveActionGroup()) {
            // skip if we couldn't have inputs yet
            return
        }

        const ag = this.currentApplyActionGroup()
        assert(ag)
        const hash = this.simApp().applySimHash()

        //if (this.canHaveLocalUserActionGroup()) {
            assert(this.currentApplySyncTick() === ag.syncTick())

            if (hash === null || hash === undefined) {
                this.debugLog("local simHash is missing (" + hash + ") for syncTick " + ag.syncTick())
                this.debugLog("              syncTick:" + this.simApp().syncTick())
                this.debugLog("  currentApplySyncTick:" + this.currentApplySyncTick())
                this.debugLog("      joinedAtSyncTick:" + this.joinedAtSyncTick())
                debugger;
                throw new Error("simHash is missing")
            }
        //}

        if (hash !== ag.hash()) {
            this.debugLog("ERROR: applying " + ag.shortId())
            this.debugLog("ERROR: simHashes don't match on apply tick " + ag.syncTick() + " local " + hash + " !== other " + ag.hash())
            const s = this.simApp().getStateString()
            this.simApp().sendSimHashMismatch()
            console.warn("simHashes don't match")
        //    throw new Error("simHashes don't match")
          //  debugger;
        }

        const actions = ag.actions()
        actions.forEach(rm => rm.sendTo(this))
        this.deleteOldActionGroups()
        //this.debugLog("currently " + this.actionGroups().size + " action groups")
    }

    // --- mouse down ---

    onMouseDown (event) {
        const p = this.userPointer().position()
        const x = (p.x() - window.innerWidth/2)/20 // quick hack - move to 2d drawing later and fix this
        const y = (window.innerHeight/2 - p.y())/20
        const pa = [x, y]
        //console.log("place: ", pa)

        const thing = BoxThing.clone().setSimEngine(this.simApp().simEngine())
        thing.pickDimensions()
        thing.setup()
        //thing.pickPosition()
        thing.setPositionArray(pa)
        thing.pickVelocity()
        //thing.pushMotionStateToBody()
        thing.stablize()
        thing.destroy()

        const rm = RemoteMessage.creationProxy().addThingString(JSON.stable_stringify(thing.asJson()))
        this.addAction(rm)
        event.stopPropagation()
    }

    onRemoteMessage_addThingString (s) {
        const json = JSON.parse(s)
        const thing = BoxThing.clone().setSimEngine(this.simApp().simEngine())
        thing.fromJson(json, this.simApp().connection())
        
        // need to read dimensions before creating shape
        // need to create body, before setting it's pos, rot, vel, rotVel

        this.simApp().simEngine().scheduleAddThing(thing)
    }

    // --- mouse move ---

    onMouseMove (event) {

    }

    timeStep () {
        this.userPointer().timeStep()
    }

    onSyncTick () {
        this.userPointer().onSyncTick()
    }

    sharePosition () {
        this.userPointer().sharePosition()
    }

    willDestroy () {
        this.userPointer().willDestroy()
    }

    debugLog (s) {
        console.log("t" + this.simApp().syncTick() + " " + this.shortId() + " " + s)
    }

    summary () {
        let s = " " + this.shortId() + " "
        s += " joined:" + this.joinedAtSyncTick()
        s += " canHaveAgs:" + this.canHaveActionGroup()
        s += " startActionTick:" + this.firstAppliableSyncTick()
        s += " ags:" + JSON.stable_stringify(Array.from(this.actionGroups().keys())) 
        return s
    }

}.initThisClass());

