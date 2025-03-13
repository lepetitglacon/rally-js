import * as CANNON from "cannon-es";
import * as BABYLON from "@babylonjs/core";
import Wheel from "./Wheel.ts";

import subaru from '@/assets/gltf/subaru.glb?url'
import engine_sound from '@/assets/sound/engine.mp3?url'

export default class Car {

    constructor() {
        const wheels: Wheel[] = [];

        const config = {
            shape: new CANNON.Vec3(2.5, .5, 1)
        }
        const chassisShape = new CANNON.Box(config.shape);
        const chassisBody = new CANNON.Body({mass: 2000, type: CANNON.BODY_TYPES.STATIC});
        chassisBody.addShape(chassisShape);
        chassisBody.position.set(0, 2, 0);
        const initialCarQuaternion = chassisBody.quaternion.clone()
        world.addBody(chassisBody);

        const chassisMesh = BABYLON.MeshBuilder.CreateBox("chassis", {
            width: config.shape.x * 2,
            height: config.shape.y * 2,
            depth: config.shape.z * 2
        }, scene);
        const chassisMat = new BABYLON.StandardMaterial('car', scene)
        chassisMesh.material = chassisMat
        chassisMesh.material.alpha = .5

        const engineSound = new BABYLON.Sound("engine", engine_sound, scene, () => {
            console.log("Sound loaded!");
            engineSound.play()
        }, {
            loop: true,
            autoplay: true,
            volume: 1
        });
    }

    async initAsync() {
        const container = await BABYLON.LoadAssetContainerAsync(subaru, scene);
        const model = container.instantiateModelsToScene()
        const rootNode = model.rootNodes[0]
        const transform = new BABYLON.TransformNode('', scene)
        transform.parent = chassisMesh
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
        const vehicle = new CANNON.RaycastVehicle({chassisBody});
        vehicle.chassisBody.quaternion = vehicle.chassisBody.quaternion.mult(BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), Math.PI / 2))
        vehicle.addToWorld(world);

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
            wheels.push(new Wheel(config, vehicle, scene))
        }
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
        if (scene.activeCamera === gameCamera) {

            // camera



            if (inputMap["z"]) {
                if (throttle < 100) {
                    throttle += throttleSpeed
                }
            } else {
                if (throttle > 0) {
                    throttle -= throttleSpeed
                }
            }
            slider.value = throttle
            if (inputMap["s"]) {
                vehicle.applyEngineForce(motorForce/2, 0);
                vehicle.applyEngineForce(motorForce/2, 2);
                vehicle.applyEngineForce(motorForce/2, 1);
                vehicle.applyEngineForce(motorForce/2, 3);
            }
            if (inputMap["q"]) {
                vehicle.setSteeringValue(-0.5, 0);
                vehicle.setSteeringValue(-0.5, 2);
            }
            if (inputMap["d"]) {
                vehicle.setSteeringValue(0.5, 0);
                vehicle.setSteeringValue(0.5, 2);
            }
            if (!inputMap["z"] && !inputMap["s"]) {
                vehicle.applyEngineForce(0, 0);
                vehicle.applyEngineForce(0, 2);
                vehicle.applyEngineForce(0, 1);
                vehicle.applyEngineForce(0, 3);
            }
            if (!inputMap["q"] && !inputMap["d"]) {
                vehicle.setSteeringValue(0, 0);
                vehicle.setSteeringValue(0, 2);
            }
        }
        force = throttle * maxForce * gears[currentGear];
        if (throttle === 0) {
            force += 400 // stopping power
        }
        vehicle.applyEngineForce(-force, 0);
        vehicle.applyEngineForce(-force, 2);

        // TODO engine sound based on throttle
        carSpeed = throttle + Math.abs(vehicle.currentVehicleSpeedKmHour)
        let pitch = minPitch + (carSpeed / maxThrottle) * (maxPitch - minPitch);
        engineSound.setPlaybackRate(pitch);

        // Sync Babylon.js meshes with Cannon.js physics
        chassisMesh.position.set(chassisBody.position.x, chassisBody.position.y, chassisBody.position.z)
        chassisMesh.rotationQuaternion = new BABYLON.Quaternion(chassisBody.quaternion.x, chassisBody.quaternion.y, chassisBody.quaternion.z, chassisBody.quaternion.w);

        for (const wheel of wheels) {
            wheel.update()
        }

        // remettre la voiture sur la piste
        ray.origin.set(chassisBody.position.x, chassisBody.position.y, chassisBody.position.z)
        const pick = scene.pickWithRay(ray, (m) => m === terrainMesh)
        if (pick.hit) {
            lastPickPosition.set(chassisBody.position.x, chassisBody.position.y, chassisBody.position.z)
        } else {
            chassisBody.quaternion.copy(initialCarQuaternion)
            chassisBody.velocity.set(0, 0, 0)
            chassisBody.position.set(
                lastPickPosition.x,
                lastPickPosition.y + 2,
                lastPickPosition.z
            )
        }
    }

}