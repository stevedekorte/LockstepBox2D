"use strict";

(class CircleThing extends SimThing {

  initPrototype () {
    this.newSlot("demo", null)
    this.newSlot("radius", 1)
    this.newSlot("height", 1)
  }

  init () {
    super.init()
    this.setTexturePath("images/cube1.jpg")
    this.setShapeDensity(5)
    this.setTextureScale(1)
  }

  // --- setup sim ---

  setupShape () {
    const shape = new Box2D.b2CircleShape();
    shape.set_m_radius(this.radius())
    this.setShape(shape)
  }

  // --- setup view ---

  uvMapper () {
    this.setTextureScale(this.radius()/1.5)
    return super.uvMapper()
  }

  setupMesh () {
    /*
    const mesh = new CubicVR.primitives.cylinder({
        radius: this.radius(),
        height: this.height(),
        lon: 24,
        material: this.material(),
        uvmapper: this.uvMapper()
      }).calcNormals().triangulateQuads().compile().clean();
    */

    const mesh = new CubicVR.primitives.sphere({
      radius: this.radius(),
      material: this.material(),
      uvmapper: this.uvMapper()
    }).calcNormals().triangulateQuads().compile().clean();

    this.setMesh(mesh)
  }


}.initThisClass());

