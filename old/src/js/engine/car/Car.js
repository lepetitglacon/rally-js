import {GUI} from 'dat.gui'
import * as CANNON from "cannon-es";
import * as THREE from "three";
import KeyboardEvents from "../events/KeyboardEvents";



export default class Car {
    constructor(world) {
        const DRAG = 0.4257
        const RR = 12.8

        this.gui_ = new GUI()
        this.keyboadEvents_ = new KeyboardEvents()

        // Cannon
        this.world = world
        this.shape_ = new CANNON.Box(new CANNON.Vec3( 1, 1, 1 ));
        this.body_ = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(0, 5, 0),
            material: new CANNON.Material( 'slipperyMaterial' )
        });
        this.body_.addShape(this.shape_)
        this.world.addBody(this.body_)

        //
        this.engine_ = new Engine()

        //
        this.traction_ = new THREE.Vector3(0,0,1).addScalar(this.engine_.force)
        this.drag_ = DRAG * 0

    }

    update() {

        this.keyboadEvents_.update()
        this.body_.velocity.z = this.keyboadEvents_.movementVector.z
        this.body_.position.z += this.body_.velocity.z


        this.body_.quaternion.setFromEuler(0, this.keyboadEvents_.movementVector.x,0)
    }
}

export class Engine {
    constructor() {
        this.gui_ = new GUI()
        this.force = 475 // EnginForce
    }

    getTraction() {
        return new CANNON.Vec3() * this.force
    }

    getDrag() {

    }
}