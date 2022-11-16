"use strict";

(class SimThing extends Serializable {

  initPrototype () {
    this.newSlot("simEngine", null)
    this.newSlot("label", "?")

    // sim
    this.newSlot("bodyDef", null)
    //this.newSlot("shapeClass", null)
    this.newSlot("shape", null)
    this.newSerializableSlot("shapeDensity", 0) // 0 for static fixtures
    this.newSlot("body", null)
    this.newSlot("fixture", null)
    this.newSerializableSlot("isStatic", false)
    this.newSerializableSlot("restitution", 1)
    this.newSerializableSlot("friction", 0)

    // view
    this.newSlot("material", null)
    this.newSerializableSlot("texturePath", null)
    this.newSlot("textureScale", 2)
    this.newSlot("mesh", null)
    this.newSlot("sceneObject", null)

    this.newSerializableSlot("motionStateMap", null) // calc for serialization, apply after deserialization
    this.newSerializableSlot("age", 0) 
  }

  setMass (m) {
    this.setShapeDensity(m)
    return this
  }

  setupDefaultMotionStateMap () {
    let m = this.motionStateMap()
    if (!m) {
      m = new Map()
      m.set("positionArray", [0, 0])
      m.set("rotationArray", [0])
      m.set("linearVelocityArray", [0, 0])
      m.set("angularVelocityArray", [0])
      this.setMotionStateMap(m)
    }
    return m
  }

  calcMotionStateMap () {
    const m = new Map()
    m.set("positionArray", this.positionArray())
    m.set("rotationArray", this.rotationArray())
    m.set("linearVelocityArray", this.linearVelocityArray())
    m.set("angularVelocityArray", this.angularVelocityArray())
    this.setMotionStateMap(m)
    return this
  }

  applyMotionStateMapIfPresent () {
    const m = this.motionStateMap()
    if (m) {
      this.setPositionArray(m.get("positionArray"))
      this.setRotationArray(m.get("rotationArray"))
      this.setLinearVelocityArray(m.get("linearVelocityArray"))
      this.setAngularVelocityArray(m.get("angularVelocityArray"))
      this.setMotionStateMap(null)
    }
    return this
  }

  asJson (loopCheck, refCreater) {
    // calc motion state slot, so it can be serialized
    if (!this.motionStateMap()) {
      this.calcMotionStateMap()
    }
    return super.asJson(loopCheck, refCreater)
  }

  fromJson (json, refResolver) {
    const result = super.fromJson(json, refResolver)
    // update motion state from motion state slot
    this.setup()
   //this.applyMotionStateMapIfPresent() // have to wait until create if using ammo.js
    return result
  }

  // --- hash ---

  simHash () {
    const m = this.motionStateMap()
    if (!m) {
      this.calcMotionStateMap()
    }
    const hash = this.motionStateMap().simHash()
    this.setMotionStateMap(m)
    return hash
  }

  // --- helpers ---

  simEngine () {
    if (!this._simEngine) {
      return app.simEngine() // hack to get around deserialization issue
    }
    return this._simEngine
  }

  scene () {
    return this.simEngine().graphicsEngine().scene()
  }

  physicsEngine () {
    return this.simEngine().physicsEngine()
  }

  world () {
    return this.simEngine().physicsEngine().world()
  }

  // ----

  init () {
    super.init()
  }

  setup () {
    this.setupSimBody()
    this.setupView()
  }

  // --- sim ---

  setupSimBody () {
    this.setupShape()
    this.setupBodyDef()
    this.setupBody()
    this.setupFixture()
  }

  setupShape () {
    // subclasses should override
    /*
    const shapeClass = this.shapeClass()
    const shape = new shapeClass();
    this.setShape(shape)
    */
  }

  // ---

  setupBodyDef () {
    const bd = new Box2D.b2BodyDef();

    if (this.isStatic()) {
      bd.set_type(Box2D.b2_staticBody);
    } else {
      bd.set_type(Box2D.b2_dynamicBody);
    }

    bd.set_position(this.ZERO());
    this.setBodyDef(bd)
  }

  setupBody () {
    const body = this.world().CreateBody(this.bodyDef());
    this.setBody(body)
  }

  setupFixture () {
    const fixture = this.body().CreateFixture(this.shape(), this.shapeDensity());
    this.setFixture(fixture)
    //fixture.SetRestitution(this.restitution())
    fixture.SetFriction(this.friction())
  }
  
  awaken () {
    this.body().SetAwake(1);
    this.body().SetActive(1);
  }

  addToWorld () {
    this.applyMotionStateMapIfPresent()
    // done in setupBody?
    this.awaken();
  }

  removeFromWorld () {
    const body = this.body()
    this.world().DestroyBody(body);
    this.setBody(null)
  }
  
  // --- view ---

  setupView () {
    this.setupMaterial()
    this.setupMesh()
    this.setupSceneObject()
  }

  setupMaterial () {
    const material = new CubicVR.Material({
      textures: {
        color: new CubicVR.Texture(this.texturePath())
      }
    });
    this.setMaterial(material)
  }

  uvMapper () {
    const s = this.textureScale()
    const uv = {
      projectionMode: CubicVR.enums.uv.projection.CUBIC,
      scale: [s, s, s]
    }
    return uv
  }

  setupMesh () {
    // subclasses should override
  }

  setupSceneObject () {
    const sceneObj = new CubicVR.SceneObject({ 
      mesh: this.mesh(), 
      position: [0, -10000, 0] 
    });
    this.setSceneObject(sceneObj)
  }

  addToScene () {
    this.scene().bindSceneObject(this.sceneObject(), true);
  }

  removeFromScene () {
    this.scene().removeSceneObject(this.sceneObject())
  }

  // --- create & destroy ---

  create () {
    this.addToWorld()
    this.addToScene()
  }

  willDestroy () {
    this.destroy()
  }

  destroy () {
    this.removeFromScene()
    this.removeFromWorld()
  }


  // --- update ---

  syncViewFromSim () {
    const body = this.body()
    const view = this.sceneObject();
    const p = body.GetPosition();
    view.position[0] = p.get_x();
    view.position[1] = p.get_y();
    view.position[2] = 0;
    view.rotation = [0, 0, body.GetAngle() * 180 / Math.PI];
  }

  isAwake () {
    return this.body().IsAwake()
  }

  // --- stablize ---

  stablize () {
    this.stablizePosition()
    //this.stablizeRotation()
  }

  // --- position ---

  stablizePosition () {
    {
      const lv1 = this.linearVelocityArray()
      this.setLinearVelocityArray(lv1)
      const lv2 = this.linearVelocityArray()
      if(!lv1.shallowEquals(lv2)) {
        debugger;
      }
    }

    const p1 = this.body().GetPosition();
    const r1 = this.body().GetAngle();
    const lv1 = this.linearVelocityArray()
    const av1 = this.angularVelocityArray()

    this.body().SetTransform(new Box2D.b2Vec2(p1.get_x(), p1.get_y()), r1);
    this.setLinearVelocityArray(lv1)
    this.setAngularVelocityArray(av1)
    
    const p2 = this.body().GetPosition();
    const r2 = this.body().GetAngle();
    const lv2 = this.linearVelocityArray()
    const av2 = this.angularVelocityArray()

    // verify
    assert(p2.get_x() === p1.get_x())
    assert(p2.get_y() === p1.get_y())
    assert(r2 === r1)
    assert(lv1.shallowEquals(lv2))
    assert(av1.shallowEquals(av2))
  }
  
  setPosXYZ (x, y, z) {
    this.setPositionArray([x, y])
    return this
  }

  // --- position array ---

  /*
  testPos () {
    const a = [17.638363116197674, 7.483171863743657]
    console.log("before:", a)
    const r = this.body().GetAngle()
    this.body().SetTransform(new Box2D.b2Vec2(a[0], a[1]), r)
    const p2 = this.body().GetPosition();
    console.log(" after:", [p2.get_x(), p2.get_y()])

    // p2 = [17.638362884521484, 7.4831719398498535]
    assert(a[0] === p2.get_x())
    assert(a[1] === p2.get_y())
    return this
  }
  */

  setPositionArray (a) {
    const r = this.body().GetAngle()
    this.body().SetTransform(new Box2D.b2Vec2(a[0], a[1]), r)
    this.stablizePosition()
    return this
  }

  positionArray () {
    const p = this.body().GetPosition();
    return [p.get_x(), p.get_y()]
  }

  // --- rotation array ---

  setRotationArray (array) { // array of values containing radians
    const p = this.body().GetPosition();
    this.body().SetTransform(p, array[0])
    return this
  }

  rotationArray () {
    const angleInRadians = this.body().GetAngle()
    return [angleInRadians]
  }

  // --- linearVelocityArray ---

  setLinearVelocityArray (array) {
    const v = new Box2D.b2Vec2(array[0], array[1])
    this.body().SetLinearVelocity(v)
    const lv = this.body().GetLinearVelocity()
    //assert(lv.x === array[0])
    //assert(lv.y === array[1])
    assert(lv.x === v.x)
    assert(lv.y === v.y)
    return this
  }

  linearVelocityArray () {
    const lv = this.body().GetLinearVelocity()
    return [lv.x, lv.y]
  }

  // --- angularVelocityArray --- 

  setAngularVelocityArray (array) {
    this.body().SetAngularVelocity(array[0])
  }

  angularVelocityArray () {
    const av = this.body().GetAngularVelocity()
    return [av]
  }

  // --- angle ---

  setAngleDegrees (a) {
    const r = a * Math.PI / 180
    const p = this.body().GetPosition();
    this.body().SetTransform(p, r)
    return this
  }

  getAngleDegrees () {
    return this.body().GetAngle() * (180 /Math.PI)
  }

  setAngleRadians (r) {
    const p = this.body().GetPosition();
    this.body().SetTransform(p, r)
    return this
  }

  getAngleRadians () {
    return this.body().GetAngle()
  }

  // --- helpers ---

  ZERO () {
    return new Box2D.b2Vec2(0.0, 0.0)
  }

  randomVec2 (s = 10) {
    const vx = s*(Math.random() - 0.5)*2
    const vy = s*(Math.random() - 0.5)*2
    return new Box2D.b2Vec2(vx, vy)
  }

  // --- timeStep ---

  timeStep () {
    this.removeIfFallenToFar() 
  }

  removeIfFallenToFar () {
    const y = this.positionArray()[1]
    if (y < -100) {
      this.simEngine().scheduleRemoveThing(this)
    }
  }

}.initThisClass());

