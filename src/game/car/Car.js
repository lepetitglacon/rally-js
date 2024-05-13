import Wordable from "../interfaces/Wordable.js";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export default class Car extends Wordable {

    constructor(options) {
        super(options);

        this.currentSpeedInt = 0
        this.lastCurrentSpeedInt = 0
        this.parkingBrakeForce = 1000

        this.addBody()
        this.addWheels()

        this.bind()
    }

    addBody() {
        this.bodyShape = new CANNON.Box(new CANNON.Vec3(3.5, 1.5, 2))
        this.body = new CANNON.Body({
            mass: 1000,
            shape: this.bodyShape
        })
        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.body
        })
        this.meshGeometry = new THREE.BoxGeometry(this.bodyShape.halfExtents.x*2, this.bodyShape.halfExtents.y*2, this.bodyShape.halfExtents.z*2)
        this.mesh = new THREE.Mesh(this.meshGeometry, this.meshMaterial)
    }

    addWheels() {
        this.wheels = []

        const wheelOptions = {
            radius: .5,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            axleLocal: new CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
            suspensionStiffness: 6.5,
            suspensionDamping: 1,
            suspensionRestLength: 1,
            frictionSlip: 4, // doit être en fonction de la vitesse actuelle
            dampingRelaxation: 2,
            dampingCompression: 5,
            maxSuspensionForce: 100000,
            rollInfluence: 0.001,
            maxSuspensionTravel: 0.5,
            useCustomSlidingRotationalSpeed: true,
            customSlidingRotationalSpeed: -5,
        }
        // const wheelOptions = {
        //     radius: .5,
        //     directionLocal: new CANNON.Vec3(0, -1, 0),
        //     axleLocal: new CANNON.Vec3(0, 0, 1),
        //     chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
        //     suspensionStiffness: 40,
        //     suspensionDamping: 3,
        //     suspensionRestLength: .5,
        //     frictionSlip: 5, // doit être en fonction de la vitesse actuelle
        //     dampingRelaxation: 2,
        //     dampingCompression: 5,
        //     maxSuspensionForce: 100000,
        //     rollInfluence: 0.001,
        //     maxSuspensionTravel: 0.5,
        //     useCustomSlidingRotationalSpeed: true,
        //     customSlidingRotationalSpeed: -5,
        // }

        wheelOptions.chassisConnectionPointLocal.set(-this.bodyShape.halfExtents.x, -this.bodyShape.halfExtents.y, this.bodyShape.halfExtents.z)
        this.vehicle.addWheel(wheelOptions)
        wheelOptions.chassisConnectionPointLocal.set(-this.bodyShape.halfExtents.x, -this.bodyShape.halfExtents.y, -this.bodyShape.halfExtents.z)
        this.vehicle.addWheel(wheelOptions)
        wheelOptions.chassisConnectionPointLocal.set(this.bodyShape.halfExtents.x, -this.bodyShape.halfExtents.y, this.bodyShape.halfExtents.z)
        this.vehicle.addWheel(wheelOptions)
        wheelOptions.chassisConnectionPointLocal.set(this.bodyShape.halfExtents.x, -this.bodyShape.halfExtents.y, -this.bodyShape.halfExtents.z)
        this.vehicle.addWheel(wheelOptions)

        // Add the wheel bodies
        this.wheelBodies = []
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
            this.wheelBodies.push(wheelBody)
        })

        this.vehicle.setBrake(this.parkingBrakeForce, 0)
        this.vehicle.setBrake(this.parkingBrakeForce, 1)
        this.vehicle.setBrake(this.parkingBrakeForce, 2)
        this.vehicle.setBrake(this.parkingBrakeForce, 3)
    }

    bind() {
        super.bind()
        this.engine.three.controls.enabled = false

        this.cameraQuaternionRotation = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/2)
        this.bodyDirection = new THREE.Vector3()
        this.idealPosition = new THREE.Vector3()

        this.engine.addEventListener('three/render/animate', e => {
            // this.engine.three.camera.quaternion.copy(this.body.quaternion.clone().mult(this.cameraQuaternionRotation))
            this.mesh.getWorldDirection(this.bodyDirection)

            this.idealPosition.copy(this.body.position)
            this.idealPosition.add(this.bodyDirection.applyAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/2))
            this.idealPosition.addScalar(2)
            this.idealPosition.y += 3.5

            this.engine.three.camera.position.lerp(this.idealPosition, 0.1)
            this.idealPosition.sub(this.bodyDirection.addScalar(2))
            this.engine.three.camera.lookAt(this.idealPosition)
        })

        document.addEventListener('keydown', (event) => {
            const maxSteerVal = .6
            const maxForce = 5000
            const brakeForce = 200

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
                    this.vehicle.setBrake(this.parkingBrakeForce, 2)
                    this.vehicle.setBrake(this.parkingBrakeForce, 3)
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

    addToWorld(scene, world) {
        super.addToWorld(scene, world);

        this.vehicle.addToWorld(world)
        for (const wheelBody of this.wheelBodies) {
            world.addBody(wheelBody)
        }

        // Update the wheel bodies
        world.addEventListener('postStep', () => {

            this.currentSpeedInt = Math.round(this.vehicle.currentVehicleSpeedKmHour)
            // if (this.lastCurrentSpeedInt !== this.currentSpeedInt) {
            //     this.dispatchEvent(new CustomEvent('speed-change', {
            //         detail: this.currentSpeedInt
            //     }))
            //     this.lastCurrentSpeedInt = this.currentSpeedInt
            // }
            // this.dispatchEvent(new CustomEvent('position-change', {
            //     detail: this.vehicle.chassisBody.position.clone()
            // }))

            // this.closestPointToCurve = this.curveFinder.getClosestPoint(this.curvePoints, this.vehicle.chassisBody.position)
            // this.dispatchEvent(new CustomEvent('closest_point-change', {
            //     detail: this.closestPointToCurve
            // }))

            // if (
            //     this.closestPointToCurve.distance > 100 &&
            //     gameEngine.running
            // ) {
            //     this.vehicle.chassisBody.position.copy(this.closestPointToCurve.point)
            // }

            for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
                this.vehicle.updateWheelTransform(i)
                const transform = this.vehicle.wheelInfos[i].worldTransform
                const wheelBody = this.wheelBodies[i]
                wheelBody.position.copy(transform.position)
                wheelBody.quaternion.copy(transform.quaternion)
            }
        })
    }

}