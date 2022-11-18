"use strict";

/*

*/


(class SimMotionState extends Serializable {

  initPrototype () {
    this.newSerializableSlot("positionArray", null)
    this.newSerializableSlot("rotationArray", null)
    this.newSerializableSlot("linearVelocityArray", null)
    this.newSerializableSlot("angularVelocityArray", null) 
  }

  init () {
    super.init()
    this.setPositionArray([0, 0])
    this.setRotationArray([0])
    this.setLinearVelocityArray([0, 0])
    this.setAngularVelocityArray([0])
  }

  copyFrom (thing) {
    this.moveFromTo(thing, this)
    return this
  }

  copyTo (thing) {
    this.moveFromTo(this, thing)
    return this
  }

  moveFromTo (source, destination) {
    destination.setPositionArray(source.positionArray())
    destination.setRotationArray(source.rotationArray())
    destination.setLinearVelocityArray(source.linearVelocityArray())
    destination.setAngularVelocityArray(source.angularVelocityArray())
    return this
  }

  assertEquals (other) {
    const pe = this.positionArray().shallowEquals(other.positionArray())
    const re = this.rotationArray().shallowEquals(other.rotationArray())
    const lve = this.linearVelocityArray().shallowEquals(other.linearVelocityArray())
    const ave = this.angularVelocityArray().shallowEquals(other.angularVelocityArray())
    assert(pe && re && lve && ave)
    return this
  }

  assertJsonEquals (other) {
    const s1 = JSON.stringify(this.asJson())
    const s2 = JSON.stringify(other.asJson())
    assert(s1 === s2)
    return this
  }

  duplicate () {
    const dup = SimMotionState.clone()
    dup.copyFrom(this)
    return dup
  }

}.initThisClass());

