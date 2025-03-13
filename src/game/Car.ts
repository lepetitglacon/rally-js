import * as CANNON from "cannon-es";
import * as BABYLON from "@babylonjs/core";
import Wheel from "./Wheel.ts";
import GameEngine from "./GameEngine";

import subaru from '@/assets/gltf/subaru.glb?url'
import engine_sound from '@/assets/sound/engine.mp3?url'

export default class Car {
    private wheels: Wheel[]
    private chassisShape: CANNON.Box;
    private chassisBody: CANNON.Body;
    chassisMesh: BABYLON.Mesh;
    private vehicle: CANNON.RaycastVehicle;
    private engineSound: BABYLON.Sound;
    private ray: BABYLON.Ray;
    private lastPickPosition: BABYLON.Vector3;

    constructor() {
        this.wheels = [];

        const config = {
            shape: new CANNON.Vec3(2.5, .5, 1)
        }
        const chassisShape = new CANNON.Box(config.shape);
        this.chassisShape = chassisShape
        const chassisBody = new CANNON.Body({mass: 2000, type: CANNON.BODY_TYPES.STATIC});
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

        const engineSound = new BABYLON.Sound("engine", engine_sound, GameEngine.scene, () => {
            console.log("Sound loaded!");
            engineSound.play()
        }, {
            loop: true,
            autoplay: true,
            volume: 1
        });
        this.engineSound = engineSound
        
        this.lastPickPosition = BABYLON.Vector3.Zero()
        this.ray = new BABYLON.Ray(BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero())
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
            this.wheels.push(new Wheel(config, vehicle, GameEngine.scene))
        }

        console.log('car loaded')
    }

    setInitialPosition(pos) {
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
        let carSpeed = 0; // Example: Replace with actual car speed from physics engine
        const minPitch = 1; // Minimum playback rate
        const maxPitch = 3; // Maximum playback rate
        const maxThrottle = 100; // Example max speed of the car
        const motorForce: number = 10000

        // Subaru WRX STI Gear Ratios
        let throttle = 0
        let throttleSpeed = 5
        let currentGear = 1; // Start in 1st gear
        let gears = [0, 3.636, 2.375, 1.761, 1.346, 0.971, 0.756];
        let finalDrive = 3.90
        let engineTorque = 400;
        let steeringValue = 0;
        let maxForce = engineTorque * finalDrive
        let force = maxForce * gears[currentGear];
        
        if (GameEngine.scene.activeCamera === GameEngine.cameraManager.gameCamera) {
            if (GameEngine.inputManager.keys.throttle) {
                if (throttle < 100) {
                    throttle += throttleSpeed
                }
            } else {
                if (throttle > 0) {
                    throttle -= throttleSpeed
                }
            }
            if (GameEngine.inputManager.keys.brake) {
                this.vehicle.applyEngineForce(motorForce/2, 0);
                this.vehicle.applyEngineForce(motorForce/2, 2);
                this.vehicle.applyEngineForce(motorForce/2, 1);
                this.vehicle.applyEngineForce(motorForce/2, 3);
            }
            if (GameEngine.inputManager.keys.left) {
                this.vehicle.setSteeringValue(-0.5, 0);
                this.vehicle.setSteeringValue(-0.5, 2);
            }
            if (GameEngine.inputManager.keys.right) {
                this.vehicle.setSteeringValue(0.5, 0);
                this.vehicle.setSteeringValue(0.5, 2);
            }
            if (!GameEngine.inputManager.keys.throttle && !GameEngine.inputManager.keys.brake) {
                this.vehicle.applyEngineForce(0, 0);
                this.vehicle.applyEngineForce(0, 2);
                this.vehicle.applyEngineForce(0, 1);
                this.vehicle.applyEngineForce(0, 3);
            }
            if (!GameEngine.inputManager.keys.right && !GameEngine.inputManager.keys.left) {
                this.vehicle.setSteeringValue(0, 0);
                this.vehicle.setSteeringValue(0, 2);
            }
        }
        
        force = throttle * maxForce * gears[currentGear];
        if (throttle === 0) {
            force += 400 // stopping power
        }
        this.vehicle.applyEngineForce(-force, 0);
        this.vehicle.applyEngineForce(-force, 2);

        // TODO engine sound based on throttle
        // carSpeed = throttle + Math.abs(this.vehicle.currentVehicleSpeedKmHour)
        // let pitch = minPitch + (carSpeed / maxThrottle) * (maxPitch - minPitch);
        // engineSound.setPlaybackRate(pitch);

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

        for (const wheel of this.wheels) {
            wheel.update()
        }
    }

}