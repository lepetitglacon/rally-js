import * as THREE from "three";
import * as CANNON from "cannon-es";
import cannonDebugger from "cannon-es-debugger";

export default class Cannon {

    constructor({engine}) {
        this.engine = engine
    }

    init() {
        this.world = new CANNON.World()
        this.debugger = new cannonDebugger(this.engine.three.scene, this.world)
        this.bind()
    }

    bind() {
        this.engine.addEventListener('three/render/animate', e => {
            this.world.fixedStep()
            this.debugger.update()
        })
    }
}