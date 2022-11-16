"use strict";

(class BoxThing extends SimThing {

  initPrototype () {
    this.newSerializableSlot("width", 1)
    this.newSerializableSlot("height", 1)
    this.newSerializableSlot("depth", 0.1)
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

  pickPosition () {
    const s = 3
    const x = s*(Math.random() - 0.5)*2;
    const y = 10 + s*(Math.random() - 0.5)*2;
    //const z = s*(Math.random() - 0.5)*2;

    const m = this.setupDefaultMotionStateMap()
    m.set("positionArray", [x, y])

    //this.setRotationArray([1, 0, 0, 1])
    return this
  }

  pickVelocity () {
    const s = 0.1
    const vx = s*(Math.random() - 0.5)*2;
    const vy = s*(Math.random() - 0.5)*2;
    //this.setLinearVelocityArray([vx, vy])

    const av = s*(Math.random() - 0.5)*2;
    //this.setAngularVelocityArray([av])

    const m = this.setupDefaultMotionStateMap()
    m.set("linearVelocityArray", [vx, vy])
    m.set("angularVelocityArray", [av])
  }

  // --- setup ---

  setupSimBody () {
    this.setupShape()
    this.setupBodyDef()
    this.setupBody()
    this.setupFixture()
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
      size: [this.width(), this.height(), this.depth()],
      material: this.material(),
      uvmapper: this.uvMapper()
    }).calcNormals().triangulateQuads().compile().clean();
    this.setMesh(mesh)
  }

}.initThisClass());

