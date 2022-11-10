"use strict";

(class FloorThing extends SimThing {

  initPrototype () {
    this.newSlot("floorHeight", -56) // -56
    this.newSlot("floorSize", 100)
  }

  init () {
    super.init()
    this.setTexturePath("images/cube1.jpg")
    this.setTextureScale(2)
    this.setShapeDensity(0)
  }

  setupBody () {
    const bodyDef = new Box2D.b2BodyDef();
    this.setBodyDef(bodyDef)

    const body = this.world().CreateBody(bodyDef)
    this.setBody(body)

    const shape = new Box2D.b2EdgeShape();
    this.setShape(shape)
    shape.Set(new Box2D.b2Vec2(-40.0, -6), new Box2D.b2Vec2(40.0, -6));
  }

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

  setupMesh () {
    const s = this.textureScale()
    const mesh = new CubicVR.primitives.box({
      size: this.floorSize(),
      material: this.material(),
      uvmapper: {
          projectionMode: CubicVR.enums.uv.projection.CUBIC,
          scale: [s,s, s]
      }
    }).calcNormals().triangulateQuads().compile().clean();
    this.setMesh(mesh)
  }

  setupSceneObject () {
    const sceneObject = new CubicVR.SceneObject({ 
      mesh: this.mesh(), 
      position: [0, this.floorHeight(), 0] 
      //position: [0, -6, 0] 
    });
    this.setSceneObject(sceneObject)
  }

  create () {
    super.create()
  }

  isAwake () {
    return true
  }

}.initThisClass());

