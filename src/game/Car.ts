import * as CANNON from "cannon-es";
import * as BABYLON from "@babylonjs/core";
import Wheel from "./Wheel.ts";
import GameEngine from "./GameEngine";

import subaru from '@/assets/gltf/subaru.glb?url'

import CarEngine from "./CarEngine.ts";

export default class Car {
    private wheels: Wheel[]
    private engine: CarEngine;

    private chassisShape: CANNON.Box;
    private chassisBody: CANNON.Body;
    public chassisMesh: BABYLON.Mesh;
    private vehicle: CANNON.RaycastVehicle;

    private

    private ray: BABYLON.Ray;
    private lastPickPosition: BABYLON.Vector3;

    private engineSound: BABYLON.Sound;

    constructor() {
        this.wheels = [];
        this.engine = new CarEngine(this)

        const config = {
            shape: new CANNON.Vec3(2.5, .5, 1)
        }
        const chassisShape = new CANNON.Box(config.shape);
        this.chassisShape = chassisShape
        const chassisBody = new CANNON.Body({
            mass: 1500,
            type: CANNON.BODY_TYPES.STATIC
        });
        this.chassisBody = chassisBody
        chassisBody.addShape(chassisShape);
        chassisBody.position.set(0, 2, 0);
        GameEngine.map.world.addBody(chassisBody);

        const chassisMesh = BABYLON.MeshBuilder.CreateBox("chassis", {
            width: config.shape.x * 2,
            height: config.shape.y * 2,
            depth: config.shape.z * 2
        }, GameEngine.scene);
        this.chassisMesh = chassisMesh
        const chassisMat = new BABYLON.StandardMaterial('car', GameEngine.scene)
        chassisMesh.material = chassisMat
        chassisMesh.material.alpha = .5
        
        this.lastPickPosition = BABYLON.Vector3.Zero()
        this.ray = new BABYLON.Ray(BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero())

        window.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                this.engine.startStopEngine()
            }
        })
    }

    async initAsync() {
        const container = await BABYLON.LoadAssetContainerAsync(subaru, GameEngine.scene);
        const model = container.instantiateModelsToScene()
        const rootNode = model.rootNodes[0]
        const transform = new BABYLON.TransformNode('', GameEngine.scene)
        transform.parent = this.chassisMesh
        rootNode.parent = transform
        transform.position.y -= 1
        // transform.rotation.y -= Math.PI / 2
        const meshes = rootNode.getChildMeshes()
        // shadowGenerator.addShadowCaster(rootNode)

        // models des roues
        const frontLeft = new BABYLON.TransformNode()
        for (const mesh of meshes.filter(m => m.id.includes('Front Left'))) {
            mesh.parent = frontLeft
        }
        const frontRight = new BABYLON.TransformNode()
        for (const mesh of meshes.filter(m => m.id.includes('Front Right'))) {
            mesh.parent = frontRight
        }
        const backLeft = new BABYLON.TransformNode()
        for (const mesh of meshes.filter(m => m.id.includes('Back Left'))) {
            mesh.parent = backLeft
        }
        const backRight = new BABYLON.TransformNode()
        for (const mesh of meshes.filter(m => m.id.includes('Back Right'))) {
            mesh.parent = backRight
        }

// Create Raycast Vehicle
        const vehicle = new CANNON.RaycastVehicle({chassisBody: this.chassisBody});
        this.vehicle = vehicle
        vehicle.chassisBody.quaternion = vehicle.chassisBody.quaternion.mult(BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), Math.PI / 2))
        vehicle.addToWorld(GameEngine.map.world);

        this.engine.attachToVehicle(vehicle);

// Add 4 wheels
        const xOffset = 1.5
        const zOffset = 1
        const wheelConfig = [
            {
                chassisConnectionPointLocal: new CANNON.Vec3(-xOffset, -0.5, zOffset),
                isFrontWheel: true,
                model: frontLeft
            }, // Front-left
            {
                chassisConnectionPointLocal: new CANNON.Vec3(xOffset, -0.5, zOffset),
                model: backLeft
            },  // Rear-left
            {
                chassisConnectionPointLocal: new CANNON.Vec3(-xOffset, -0.5, -zOffset),
                isFrontWheel: true,
                model: frontRight
            }, // Front-right
            {
                chassisConnectionPointLocal: new CANNON.Vec3(xOffset, -0.5, -zOffset),
                model: backRight
            },  // Rear-right
        ];

        for (const config of wheelConfig) {
            this.wheels.push(new Wheel(config, vehicle, GameEngine.scene, this))
        }

        console.log('car loaded')
    }

    setInitialPosition(pos) {
        // this.vehicle.setBrake(100, 0)
        // this.vehicle.setBrake(100, 2)

        setTimeout(() => {
            this.chassisBody.position.set(
                pos.x,
                pos.y - .25,
                pos.z,
            )
            this.chassisBody.type = CANNON.BODY_TYPES.DYNAMIC
        }, 500)
    }

    getDirection() {
        const quaternion = this.chassisBody.quaternion;
        const localForward = new CANNON.Vec3(-1, 0, 0); // Local forward direction
        const worldForward = new CANNON.Vec3();
        quaternion.vmult(localForward, worldForward); // Convert to world space
        return new BABYLON.Vector3(worldForward.x, worldForward.y, worldForward.z);
    }

    update() {
        // Appliquer les contrôles
        this.engine.setThrottle(GameEngine.inputManager.keys.throttle ? 1 : 0);
        this.engine.update(1/60)
        const engineInfo = this.engine.getEngineInfo();

        for (const wheel of this.wheels) {
            wheel.update()
        }

        if (GameEngine.scene.activeCamera === GameEngine.cameraManager.gameCamera) {
            // if (GameEngine.inputManager.keys.brake) {
            //     this.vehicle.setBrake(5, 0);
            //     this.vehicle.setBrake(5, 2);
            //     this.vehicle.setBrake(5, 1);
            //     this.vehicle.setBrake(5, 3);
            // } else {
            //     this.vehicle.setBrake(0, 0);
            //     this.vehicle.setBrake(0, 2);
            //     this.vehicle.setBrake(0, 1);
            //     this.vehicle.setBrake(0, 3);
            // }
            // if (!GameEngine.inputManager.keys.throttle && !GameEngine.inputManager.keys.brake) {
            //     this.vehicle.applyEngineForce(0, 0);
            //     this.vehicle.applyEngineForce(0, 2);
            //     this.vehicle.applyEngineForce(0, 1);
            //     this.vehicle.applyEngineForce(0, 3);
            // }
            if (GameEngine.inputManager.keys.left) {
                this.vehicle.setSteeringValue(-0.5, 0);
                this.vehicle.setSteeringValue(-0.5, 2);
            }
            if (GameEngine.inputManager.keys.right) {
                this.vehicle.setSteeringValue(0.5, 0);
                this.vehicle.setSteeringValue(0.5, 2);
            }
            if (!GameEngine.inputManager.keys.right && !GameEngine.inputManager.keys.left) {
                this.vehicle.setSteeringValue(0, 0);
                this.vehicle.setSteeringValue(0, 2);
            }

        }

        // remettre la voiture sur la piste
        // this.ray.origin.set(
        //     this.chassisBody.position.x,
        //     this.chassisBody.position.y,
        //     this.chassisBody.position.z
        // )
        // const pick = GameEngine.scene.pickWithRay(
        //     this.ray,
        //     (m) => m === GameEngine.map.terrainMesh
        // )
        // if (pick.hit) {
        //     this.lastPickPosition.set(
        //         this.chassisBody.position.x,
        //         this.chassisBody.position.y,
        //         this.chassisBody.position.z
        //     )
        // } else {
        //     // this.chassisBody.quaternion.copy(initialCarQuaternion)
        //     this.chassisBody.velocity.set(0, 0, 0)
        //     this.chassisBody.position.set(
        //         this.lastPickPosition.x,
        //         this.lastPickPosition.y + 2,
        //         this.lastPickPosition.z
        //     )
        // }

        // Sync Babylon.js meshes with Cannon.js physics
        this.chassisMesh.position.set(
            this.chassisBody.position.x, 
            this.chassisBody.position.y, 
            this.chassisBody.position.z
        )
        this.chassisMesh.rotationQuaternion = new BABYLON.Quaternion(
            this.chassisBody.quaternion.x, 
            this.chassisBody.quaternion.y, 
            this.chassisBody.quaternion.z, 
            this.chassisBody.quaternion.w
        );
    }

}