import * as BABYLON from "@babylonjs/core";
import * as CANNON from "cannon-es";
import type {WheelInfoOptions} from "objects/WheelInfo";
import GameEngine from "./GameEngine.ts";
import type Car from "./Car.ts";

export default class Wheel {
    private params: CANNON.WheelInfoOptions;
    private car: Car;
    private vehicle: CANNON.RaycastVehicle;
    private mesh: BABYLON.Mesh;
    private shape: CANNON.Shape;
    private body: CANNON.Body;
    private id: number;
    private debugMesh: BABYLON.Mesh;
    private baseFriction: number;

    static wheelTransformQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0,-1,0), Math.PI / 2)
    static wheelMaterial = new CANNON.Material('wheel')

    constructor(params, vehicle, scene, car: Car) {

        this.car = car
        this.vehicle = vehicle
        this.params = {
            radius: 0.35,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            suspensionMaxLength: 0.5,
            maxSuspensionForce: 100000,
            frictionSlip: 3,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionTravel: 0.5,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true,
            axleLocal: new CANNON.Vec3(0, 0, 1),
            useWorldNormal: true,
            ...params
        } as WheelInfoOptions
        this.baseFriction = this.params.frictionSlip

        this.mesh = params.model
        this.mesh.setPivotPoint(BABYLON.Vector3.Zero())
        this.mesh.rotationQuaternion = new BABYLON.Quaternion()
        this.mesh.rotationQuaternion.multiplyInPlace(Wheel.wheelTransformQuaternion)

        this.debugMesh = BABYLON.MeshBuilder.CreateIcoSphere('', {
            radius: .35
        }, scene)
        this.debugMesh.material = new BABYLON.StandardMaterial('', scene)
        this.debugMesh.material.alpha = 0
        this.debugMesh.rotationQuaternion = new BABYLON.Quaternion()

        this.shape = new CANNON.Cylinder(this.params.radius, this.params.radius, this.params.radius / 2, 20)

        this.body = new CANNON.Body({
            mass: 0,
            material: Wheel.wheelMaterial,
            type: CANNON.Body.KINEMATIC
        })
        this.body.collisionFilterGroup = 0 // turn off collisions
        const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)
        this.body.addShape(this.shape, new CANNON.Vec3(), quaternion)

        this.id = this.vehicle.addWheel(this.params);
    }

    update() {
        const wheelInfos = this.vehicle.wheelInfos[this.id];

        // wheelInfos.engineForce = -this.car.engine.wheelTorque
        wheelInfos.engineForce = 100
        // update la friction en fonction de la vitesse
        // TODO https://chatgpt.com/c/67d1ff20-1ce0-8013-a3ff-ce3d3e1e035f
        let speed = this.vehicle.chassisBody.velocity.length();
        let friction = this.baseFriction * Math.max(0.5, 1 - (speed / 100));
        friction = Math.max(friction, 0.2);
        wheelInfos.frictionSlip = friction;

        // if (inputMap["z"]) {
        //     if (wheelInfos.isFrontWheel) {
        //         wheelInfos.frictionSlip = friction - 0.2
        //     }
        // }
        // if (inputMap["s"]) {
        //     if (wheelInfos.isFrontWheel) {
        //         wheelInfos.frictionSlip = this.baseFriction
        //     }
        // }

        if (GameEngine.inputManager.keys.handbrake) {
            this.vehicle.setBrake(5, 1);
            this.vehicle.setBrake(5, 3);
            wheelInfos.frictionSlip = .5
        } else {
            this.vehicle.setBrake(0, 1);
            this.vehicle.setBrake(0, 3);
            wheelInfos.frictionSlip = friction
        }


        this.vehicle.updateWheelTransform(this.id);
        const worldTransform = wheelInfos.worldTransform;
        this.body.position.copy(worldTransform.position)
        this.body.quaternion.copy(worldTransform.quaternion)

        this.mesh.position.copyFromFloats(this.body.position.x, this.body.position.y, this.body.position.z);
        this.mesh.rotationQuaternion.copyFromFloats(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w)
        this.mesh.rotationQuaternion.multiplyInPlace(Wheel.wheelTransformQuaternion)

        this.debugMesh.position.copyFromFloats(this.body.position.x, this.body.position.y, this.body.position.z);
        this.debugMesh.rotationQuaternion.copyFromFloats(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w)
        this.debugMesh.rotationQuaternion.multiplyInPlace(Wheel.wheelTransformQuaternion)


    }

}