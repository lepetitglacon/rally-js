import * as BABYLON from "@babylonjs/core";
import * as CANNON from "cannon-es";
import type {WheelInfo, WheelInfoOptions} from "objects/WheelInfo";
import GameEngine from "../GameEngine.ts";
import type Car from "./Car.ts";
import {Lerp} from "@babylonjs/core/Maths/math.scalar.functions";

export default class Wheel {
    params: CANNON.WheelInfoOptions;
    car: Car;
    vehicle: CANNON.RaycastVehicle;
    mesh: BABYLON.Mesh;
    shape: CANNON.Shape;
    body: CANNON.Body;
    id: number;
    debugMesh: BABYLON.Mesh;
    baseFriction: number;
    infos: WheelInfo;
    isFront: boolean;
    isRight: boolean;

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
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionTravel: 0.5,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true,
            axleLocal: new CANNON.Vec3(0, 0, 1),
            useWorldNormal: true,
            ...params
        } as WheelInfoOptions

        this.id = this.vehicle.addWheel(this.params);
        this.infos = this.vehicle.wheelInfos[this.id]
        this.isFront = this.id === 0 || this.id === 2
        this.isRight = this.id === 1 || this.id === 2

        this.baseFriction = this.params.frictionSlip ?? 5

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
    }

    getFrictionSlip() {
        if (-this.car.vehicle.currentVehicleSpeedKmHour < 30) return this.baseFriction
        else if (-this.car.vehicle.currentVehicleSpeedKmHour < 50) return this.baseFriction - 0.5
        else if (-this.car.vehicle.currentVehicleSpeedKmHour < 70) return this.baseFriction - 1
        else if (-this.car.vehicle.currentVehicleSpeedKmHour < 90) return this.baseFriction - 2
        else if (-this.car.vehicle.currentVehicleSpeedKmHour < 110) return this.baseFriction - 3
        else return 0.5
    }

    update() {
        const wheelInfos = this.vehicle.wheelInfos[this.id];

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