"use strict";

(class BoxThing extends SimThing {

  initPrototype () {
    this.newSerializableSlot("width", 1)
    this.newSerializableSlot("height", 1)
    this.newSerializableSlot("depth", 0.1)
  }

  dimensionsArray () {
    return [this.width(), this.height(), this.depth()]
  }

  init () {
    super.init()
    //this.setShapeClass(Box2D.b2BodyDef)
    this.setTexturePath("client/resources/images/cube1.jpg")
    this.setShapeDensity(1)
  }

  // --- picking setup ---

  pickDimensions () {
    if (this.body()) {
      throw new Error("can't change body dimensions")
    }

    /*
    this.setWidth(Math.random()*2 + 0.1)
    this.setHeight(Math.random()*2 + 0.1)
    //this.setDepth(Math.random()*2 + 0.1)
    this.setDepth(0.1)
    */
    return this
  }

  randomInRange (x1, x2, digits = 2) {
    assert(x1 <= x2)
    const v = x1 + ((x2 - x1) * Math.random())
    const p = Math.pow(10, digits)
    const r = Math.floor(v*p)/p
    return r
  }

  pickPosition () {
    const s = 3
    const x = this.randomInRange(-s, s);
    const y = 10 + this.randomInRange(-s, s);
    this.motionState().setPositionArray([x, y])
    return this
  }

  pickVelocity () {
    const s = 3
    const vx = this.randomInRange(-s, s);
    const vy = this.randomInRange(-s, s);
    this.motionState().setLinearVelocityArray([vx, vy])

    const av = this.randomInRange(-s, s);
    this.motionState().setAngularVelocityArray([av])
  }

  // --- setup sim ---

  setupShape () {
    const shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(this.width()/2, this.height()/2);
    this.setShape(shape)
  }
  
  // --- setup view ---

  setupMesh () {
    const s = this.textureScale()
    const mesh = new CubicVR.primitives.box({
      size: this.dimensionsArray(),
      material: this.material(),
      uvmapper: this.uvMapper()
    }).calcNormals().triangulateQuads().compile().clean();
    this.setMesh(mesh)
  }

}.initThisClass());

