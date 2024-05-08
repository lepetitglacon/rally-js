import * as CANNON from "cannon-es";
import Engine from "../Engine.js";
import {useCannonContext} from "../useCannonContext.js";
import CurveFinder from "../../maths/CurveFinder.js";
import * as THREE from "three";
const { world } = useCannonContext()

export class Car extends EventTarget {

    constructor() {
        super();


        this.curvePoints = [
            new THREE.Vector3(1000, 0, -900),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(100, 0, 100),
            new THREE.Vector3(300, 0, 300),
            new THREE.Vector3(500, 0, 500),
            new THREE.Vector3(-100, 0, -100),
        ]
        this.curveFinder = new CurveFinder(CurveFinder.TYPES.BRUTE_FORCE)

        this.shape = new CANNON.Box(new CANNON.Vec3(3.5, 1.5, 2))
        this.body = new CANNON.Body({
            mass: 1000,
            shape: this.shape
        })
        // this.body.position.y = 125
        // this.body.position.z += 20

        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.body
        })
        this.vehicle.addToWorld(world)

        this.currentSpeedInt = 0
        this.lastCurrentSpeedInt = 0

        this.wheels = []
        const wheelOptions = {
            radius: .5,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            axleLocal: new CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
            suspensionStiffness: 40,
            suspensionDamping: 3,
            suspensionRestLength: .5,
            frictionSlip: 1, // doit être en fonction de la vitesse actuelle
            dampingRelaxation: 2,
            dampingCompression: 5,
            maxSuspensionForce: 100000,
            rollInfluence: 0.001,
            maxSuspensionTravel: 0.5,
            useCustomSlidingRotationalSpeed: true,
            customSlidingRotationalSpeed: -5,
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

            this.currentSpeedInt = Math.round(this.vehicle.currentVehicleSpeedKmHour)
            if (this.lastCurrentSpeedInt !== this.currentSpeedInt) {
                this.dispatchEvent(new CustomEvent('speed-change', {
                    detail: this.currentSpeedInt
                }))
                this.lastCurrentSpeedInt = this.currentSpeedInt
            }
            this.dispatchEvent(new CustomEvent('position-change', {
                detail: this.vehicle.chassisBody.position.clone()
            }))

            this.closestPointToCurve = this.curveFinder.getClosestPoint(this.curvePoints, this.vehicle.chassisBody.position)
            this.dispatchEvent(new CustomEvent('closest_point-change', {
                detail: this.closestPointToCurve
            }))

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
            const brakeForce = 200
            const parkingBrakeForce = 1000000

            switch (event.key) {
                case 'z':
                case 'ArrowUp':
                    this.vehicle.applyEngineForce(-maxForce, 2)
                    this.vehicle.applyEngineForce(-maxForce, 3)
                    break

                case 's':
                case 'ArrowDown':
                    this.vehicle.setBrake(brakeForce/2, 0)
                    this.vehicle.setBrake(brakeForce/2, 1)
                    this.vehicle.setBrake(brakeForce, 2)
                    this.vehicle.setBrake(brakeForce, 3)
                    // this.vehicle.applyEngineForce(maxForce, 1)
                    // this.vehicle.applyEngineForce(maxForce, 2)
                    // this.vehicle.applyEngineForce(maxForce, 3)
                    // this.vehicle.applyEngineForce(maxForce, 4)
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
                    this.vehicle.setBrake(parkingBrakeForce, 2)
                    this.vehicle.setBrake(parkingBrakeForce, 3)
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
                    this.vehicle.setBrake(0, 0)
                    this.vehicle.setBrake(0, 1)
                    this.vehicle.setBrake(0, 2)
                    this.vehicle.setBrake(0, 3)
                    // this.vehicle.applyEngineForce(0, 0)
                    // this.vehicle.applyEngineForce(0, 1)
                    // this.vehicle.applyEngineForce(0, 2)
                    // this.vehicle.applyEngineForce(0, 3)
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
    }
}
