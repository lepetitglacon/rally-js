import {useCannonContext} from "./useCannonContext.js";
import * as CANNON from "cannon-es";
import { computed } from 'vue'
import { useGamepad } from '@vueuse/core'
import * as THREE from "three";
import Wheel from "./Wheel.js";
import Engine from "./Engine.js";

const { world } = useCannonContext()

export function useCar() {
    return {car: new Car()}
}

export class Car {

    constructor() {

        this.shape = new CANNON.Box(new CANNON.Vec3(3.5, 1.5, 2))
        this.body = new CANNON.Body({
            mass: 1000,
            shape: this.shape,
            type: CANNON.Body.KINEMATIC
        })
        this.body.position.y = 125
        this.body.position.z += 20
        world.addBody(this.body)

        this.wheels = []

        this.engine = new Engine({
            horsepower: 100,
            maxRPM: 8000,
            gearRatios: {
                0: 0, // neutral
                1: 3.5, // 1st gear ratio (high torque)
                2: 2.5, // 2nd gear ratio
                3: 1.8, // 3rd gear ratio
                4: 1.2, // 4th gear ratio
                5: 0.8,  // 5th gear ratio (overdrive, fuel efficiency)
                6: 0.4  // 6th gear ratio (overdrive, fuel efficiency)
            }
        })

        this.createWheels()
    }

    createWheels() {
        const wheelHeight = -1.5
        for (let i = 0; i < 4; i++) {
            const wheelPosition = new CANNON.Vec3()
            let enableMotor = false

            if (i === 0) {
                wheelPosition.set(-this.shape.halfExtents.x, wheelHeight, -this.shape.halfExtents.z)
                enableMotor = true
            }
            if (i === 1) {
                wheelPosition.set(-this.shape.halfExtents.x, wheelHeight, this.shape.halfExtents.z)
                enableMotor = true
            }
            if (i === 2) {
                wheelPosition.set(this.shape.halfExtents.x, wheelHeight, -this.shape.halfExtents.z)
            }
            if (i === 3) {
                wheelPosition.set(this.shape.halfExtents.x, wheelHeight, this.shape.halfExtents.z)
            }

            this.wheels.push(new Wheel({
                config: {
                    enableMotor: enableMotor,
                    wheelPosition: wheelPosition
                },
                car: this
            }))
        }
    }

    update(acceleration, rotation, gear) {
        this.engine.shiftGear(gear)
        this.engine.update(acceleration)


        for (const wheel of this.wheels) {
            wheel.update(this.engine.currentMotorForce, rotation)
        }
    }
}
