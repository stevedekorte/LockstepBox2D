"use strict";

(class BoxThing extends SimThing {

  initPrototype () {
    this.newSlot("demo", null)
    this.newSlot("width", 2)
    this.newSlot("height", 1)
    this.newSlot("depth", 1)
  }

  init () {
    super.init()
    //this.setShapeClass(Box2D.b2BodyDef)
    this.setTexturePath("client/resources/images/cube1.jpg")
    this.setShapeDensity(5)
  }

  // --- picking setup ---

  pickDimensions () {
    if (this.body()) {
      throw new Error("can't change body dimensions")
    }

    this.setWidth(Math.random()*2 + 0.1)
    this.setHeight(Math.random()*2 + 0.1)
    //this.setDepth(Math.random()*2 + 0.1)
    this.setDepth(0.1)
    return this
  }

  pickPosition () {
    const s = 30
    const x = s*(Math.random() - 0.5)*2;
    const y = s*(Math.random() - 0.5)*2;
    //const z = s*(Math.random() - 0.5)*2;
    const z = 0

    this.setPosXYZ(x, 30 + y, z)

    //this.setRotationArray([1, 0, 0, 1])
    return this
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

