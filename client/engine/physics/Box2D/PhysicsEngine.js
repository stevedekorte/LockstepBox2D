"use strick";

//var Module = { TOTAL_MEMORY: 512 * 1024 * 1024 };

(class PhysicsEngine extends Base { 

  static load (doneCallback) {
    console.log("loading Box2D")
    Box2D().then((Box2D) => {
      getGlobalThis().Box2D = Box2D
      doneCallback()
    })
  }

  initPrototype () {
    this.newSlot("world", null)
    this.newSlot("totalTime", 0)
    this.newSlot("isPaused", false)
  }

  init () {
    super.init()
  }

  setup () {
    //console.log(this.type() + ".setup()")
    const gravity = new Box2D.b2Vec2(0.0, -10.0); 
    //const gravity = new Box2D.b2Vec2(0.0, 0.0); 
    const world = new Box2D.b2World(gravity)
    this.setWorld(world);
    return this
  }

  destroy () {
  }

  simulate (dt) {
    dt = dt || 1;
    this.world().Step(dt, 2, 2); 
  }

}.initThisClass());


