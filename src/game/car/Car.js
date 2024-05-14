import Wordable from "../interfaces/Wordable.js";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export default class Car extends Wordable {

    constructor(options) {
        super(options);

        this.currentSpeedInt = 0
        this.lastCurrentSpeedInt = 0
        this.brakeForce = 100
        this.parkingBrakeForce = 1000
        this.engineForce = 2500
        this.maxSteering = 0.6

        this.maxKmH = 180

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
        const centerOfMassOffset = new CANNON.Vec3(0, 0.1, 0); // Example offset
        this.body.shapeOffsets[0].copy(centerOfMassOffset);
        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.body
        })
        this.meshGeometry = new THREE.BoxGeometry(this.bodyShape.halfExtents.x*2, this.bodyShape.halfExtents.y*2, this.bodyShape.halfExtents.z*2)
        this.mesh = new THREE.Mesh(this.meshGeometry, this.meshMaterial)
    }

    addWheels() {
        this.wheels = []

        const wheelOptions = {
            radius: .65,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            axleLocal: new CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
            suspensionStiffness: 6.5,
            suspensionDamping: 2,
            suspensionRestLength: .65,
            frictionSlip: 2, // doit être en fonction de la vitesse actuelle
            dampingRelaxation: 2,
            dampingCompression: 5,
            maxSuspensionForce: 100000,
            rollInfluence: 0.001,
            maxSuspensionTravel: .5,
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
        wheelOptions.frictionSlip = 2.5
        this.vehicle.addWheel(wheelOptions)
        wheelOptions.chassisConnectionPointLocal.set(this.bodyShape.halfExtents.x, -this.bodyShape.halfExtents.y, -this.bodyShape.halfExtents.z)
        this.vehicle.addWheel(wheelOptions)

        // Add the wheel bodies
        this.wheelBodies = []
        const wheelMaterial = new CANNON.Material('wheel')
        this.vehicle.wheelInfos.forEach((wheel) => {
            const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius, 20)
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

        this.cameraQuaternionRotation = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2)
        this.bodyDirection = new THREE.Vector3()
        this.idealPosition = new THREE.Vector3()

        document.addEventListener('keydown', e => {
            if (e.key === 'r') {
                // this.vehicle.chassisBody.quaternion.set(0, 0, 0, 0)
                this.vehicle.chassisBody.position.y +=1
            }
            if (e.key === 'c') {
                this.engine.three.controls.enabled = !this.engine.three.controls.enabled
            }
        })

        this.engine.addEventListener('three/render/animate', e => {
            this.engine.ui.debugInfos.speed = this.vehicle.currentVehicleSpeedKmHour

            if (!this.engine.three.controls.enabled) {
                const offset = new THREE.Vector3(0, 5, 10);
                offset.applyQuaternion(this.body.quaternion)
                offset.applyQuaternion(this.cameraQuaternionRotation)
                offset.add(this.body.position)

                const lookAt = this.body.position;
                this.mesh.getWorldDirection(this.bodyDirection)
                lookAt.vadd(this.bodyDirection)

                this.engine.three.camera.position.copy(offset)
                this.engine.three.camera.lookAt(lookAt.x, lookAt.y + 5, lookAt.z)
            } else {
                this.engine.three.controls.target.copy(this.body.position)
            }

            // frein  moteur
            if (this.vehicle.currentVehicleSpeedKmHour < 0) {
                this.vehicle.applyEngineForce(this.engineForce/10, 2)
                this.vehicle.applyEngineForce(this.engineForce/10, 3)
            }

            if (this.engine.zqsdInput.z) {
                if (Math.abs(this.vehicle.currentVehicleSpeedKmHour) < this.maxKmH) {
                    this.vehicle.applyEngineForce(-this.engineForce, 2)
                    this.vehicle.applyEngineForce(-this.engineForce, 3)
                }
            }
            if (this.engine.zqsdInput.s) {
                this.vehicle.setBrake(this.brakeForce/2, 0)
                this.vehicle.setBrake(this.brakeForce/2, 1)
                this.vehicle.setBrake(this.brakeForce, 2)
                this.vehicle.setBrake(this.brakeForce, 3)
            } else {
                this.vehicle.setBrake(0, 0)
                this.vehicle.setBrake(0, 1)
                this.vehicle.setBrake(0, 2)
                this.vehicle.setBrake(0, 3)
            }
            if (this.engine.zqsdInput.d || this.engine.zqsdInput.q) {
                if (this.engine.zqsdInput.d) {
                    this.vehicle.setSteeringValue(-this.maxSteering, 0)
                    this.vehicle.setSteeringValue(-this.maxSteering, 1)
                }
                if (this.engine.zqsdInput.q) {
                    this.vehicle.setSteeringValue(this.maxSteering, 0)
                    this.vehicle.setSteeringValue(this.maxSteering, 1)
                }
            } else {
                this.vehicle.setSteeringValue(0, 0)
                this.vehicle.setSteeringValue(0, 1)
            }
            if (this.engine.zqsdInput.space) {
                this.vehicle.setBrake(this.parkingBrakeForce, 2)
                this.vehicle.setBrake(this.parkingBrakeForce, 3)
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