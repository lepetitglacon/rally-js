import * as CANNON from "cannon-es";
import Engine from "../Engine.js";
import {useCannonContext} from "../useCannonContext.js";
const { world } = useCannonContext()

export class Car {

    constructor() {
        this.shape = new CANNON.Box(new CANNON.Vec3(3.5, 1.5, 2))
        this.body = new CANNON.Body({
            mass: 1000,
            shape: this.shape
        })
        this.body.position.y = 125
        this.body.position.z += 20

        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.body
        })
        this.vehicle.addToWorld(world)

        this.wheels = []
        const wheelOptions = {
            radius: 0.5,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 1.4,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true,
        }

        wheelOptions.chassisConnectionPointLocal.set(-this.shape.halfExtents.x, -this.shape.halfExtents.y, this.shape.halfExtents.z)
        this.vehicle.addWheel(wheelOptions)
        wheelOptions.chassisConnectionPointLocal.set(-this.shape.halfExtents.x, -this.shape.halfExtents.y, -this.shape.halfExtents.z)
        this.vehicle.addWheel(wheelOptions)
        wheelOptions.chassisConnectionPointLocal.set(this.shape.halfExtents.x, -this.shape.halfExtents.y, this.shape.halfExtents.z)
        this.vehicle.addWheel(wheelOptions)
        wheelOptions.chassisConnectionPointLocal.set(this.shape.halfExtents.x, -this.shape.halfExtents.y, -this.shape.halfExtents.z)
        this.vehicle.addWheel(wheelOptions)

        // Add the wheel bodies
        const wheelBodies = []
        const wheelMaterial = new CANNON.Material('wheel')
        this.vehicle.wheelInfos.forEach((wheel) => {
            const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
            const wheelBody = new CANNON.Body({
                mass: 0,
                material: wheelMaterial,
            })
            wheelBody.type = CANNON.Body.KINEMATIC
            wheelBody.collisionFilterGroup = 0 // turn off collisions
            const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)
            wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion)
            wheelBodies.push(wheelBody)
            world.addBody(wheelBody)
        })

        // Update the wheel bodies
        world.addEventListener('postStep', () => {
            for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
                this.vehicle.updateWheelTransform(i)
                const transform = this.vehicle.wheelInfos[i].worldTransform
                const wheelBody = wheelBodies[i]
                wheelBody.position.copy(transform.position)
                wheelBody.quaternion.copy(transform.quaternion)
            }
        })

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

        document.addEventListener('keydown', (event) => {
            const maxSteerVal = .6
            const maxForce = 5000
            const brakeForce = 1000000

            console.log(this.vehicle.currentVehicleSpeedKmHour)
            console.log(this.vehicle.constraints)

            switch (event.key) {
                case 'z':
                case 'ArrowUp':
                    this.vehicle.applyEngineForce(-maxForce, 2)
                    this.vehicle.applyEngineForce(-maxForce, 3)
                    break

                case 's':
                case 'ArrowDown':
                    this.vehicle.applyEngineForce(maxForce, 2)
                    this.vehicle.applyEngineForce(maxForce, 3)
                    break

                case 'q':
                case 'ArrowLeft':
                    this.vehicle.setSteeringValue(maxSteerVal, 0)
                    this.vehicle.setSteeringValue(maxSteerVal, 1)
                    break

                case 'd':
                case 'ArrowRight':
                    this.vehicle.setSteeringValue(-maxSteerVal, 0)
                    this.vehicle.setSteeringValue(-maxSteerVal, 1)
                    break

                case ' ':
                    // this.vehicle.setBrake(brakeForce, 0)
                    // this.vehicle.setBrake(brakeForce, 1)
                    this.vehicle.setBrake(brakeForce, 2)
                    this.vehicle.setBrake(brakeForce, 3)
                    break
            }
        })

        // Reset force on keyup
        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'z':
                case 'ArrowUp':
                    this.vehicle.applyEngineForce(0, 2)
                    this.vehicle.applyEngineForce(0, 3)
                    break

                case 's':
                case 'ArrowDown':
                    this.vehicle.applyEngineForce(0, 2)
                    this.vehicle.applyEngineForce(0, 3)
                    break

                case 'q':
                case 'ArrowLeft':
                    this.vehicle.setSteeringValue(0, 0)
                    this.vehicle.setSteeringValue(0, 1)
                    break

                case 'd':
                case 'ArrowRight':
                    this.vehicle.setSteeringValue(0, 0)
                    this.vehicle.setSteeringValue(0, 1)
                    break

                case ' ':
                    // this.vehicle.setBrake(0, 0)
                    // this.vehicle.setBrake(0, 1)
                    this.vehicle.setBrake(0, 2)
                    this.vehicle.setBrake(0, 3)
                    break
            }
        })

        // this.createWheels()
    }

    createWheels() {
        const wheelHeight = -1.5

        for (let i = 0; i < 25; i++) {
            const geometry = new CANNON.Sphere(1)
            const body = new CANNON.Body({shape: geometry, mass: 1})
            body.position.x = i + 25
            body.position.y = 300
            world.addBody(body)
        }

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
