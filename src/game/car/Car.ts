import * as CANNON from "cannon-es";
import * as BABYLON from "@babylonjs/core";
import Wheel from "./Wheel.ts";
import GameEngine from "../GameEngine.ts";

import subaru from '@/assets/gltf/subaru.glb?url'

import CarEngine from "./CarEngine.ts";
import {RunState} from "../Stage.ts";
import type {RaycastResult} from "collision/RaycastResult";

export default class Car {
    wheels: Wheel[]
    engine: CarEngine;

    chassisShape: CANNON.Box;
    chassisBody: CANNON.Body;
    chassisMesh: BABYLON.Mesh;
    vehicle: CANNON.RaycastVehicle;

    isInInitMode = true;

    ray: BABYLON.Ray;
    lastPickPosition: BABYLON.Vector3;
    lastSafeState = {
        position: new CANNON.Vec3(),
        quaternion: new CANNON.Quaternion()
    };

    private breakForce: number = 150;

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
        GameEngine.stage.world.addBody(chassisBody);

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

        GameEngine.eventManager.onControllerStartButton.add(() => {
            this.engine.startStopEngine()
        })
        GameEngine.eventManager.onControllerHandbrakeButton.add(() => {
            if (GameEngine.stage.state === RunState.INIT) {
                this.vehicle.setBrake(0, 0)
                this.vehicle.setBrake(0, 1)
                this.vehicle.setBrake(0, 2)
                this.vehicle.setBrake(0, 3)
                GameEngine.eventManager.onUserHandBreakForTheFirstTime.notifyObservers({})
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

        const vehicle = new CANNON.RaycastVehicle({chassisBody: this.chassisBody});
        this.vehicle = vehicle
        vehicle.chassisBody.quaternion = vehicle.chassisBody.quaternion.mult(BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), Math.PI / 2))
        vehicle.addToWorld(GameEngine.stage.world);

        this.engine.attachToVehicle(vehicle);

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

        GameEngine.eventManager.onCarLoader.notifyObservers(this)
        console.log('car loaded')
    }

    setInitialPosition(pos) {
        this.isInInitMode = true
        this.vehicle.setBrake(10000, 0)
        this.vehicle.setBrake(10000, 1)
        this.vehicle.setBrake(10000, 2)
        this.vehicle.setBrake(10000, 3)

        setTimeout(() => {
            this.chassisBody.position.set(
                pos.x,
                pos.y - .25,
                pos.z,
            )
            this.chassisBody.type = CANNON.BODY_TYPES.DYNAMIC
        }, 500)
        GameEngine.eventManager.onCarInitialized.notifyObservers({})
    }

    getDirection() {
        const quaternion = this.chassisBody.quaternion;
        const localForward = new CANNON.Vec3(-1, 0, 0); // Local forward direction
        const worldForward = new CANNON.Vec3();
        quaternion.vmult(localForward, worldForward); // Convert to world space
        return new BABYLON.Vector3(worldForward.x, worldForward.y, worldForward.z);
    }

    performRaycastsAroundCar(): {
        forward: RaycastResult | null,
        backward: RaycastResult | null,
        left: RaycastResult | null,
        right: RaycastResult | null,
        up: RaycastResult | null,
        down: RaycastResult | null,
    } {
        const rayLength = 2; // How far to cast
        const rayStart = this.chassisBody.position.clone();
        const carQuat = this.chassisBody.quaternion;
        const directions = {
            // Axis-aligned
            forward:     new CANNON.Vec3(0, 0, 1),
            backward:    new CANNON.Vec3(0, 0, -1),
            left:        new CANNON.Vec3(-1, 0, 0),
            right:       new CANNON.Vec3(1, 0, 0),
            up:          new CANNON.Vec3(0, 1, 0),
            down:        new CANNON.Vec3(0, -1, 0),
            forwardLeft:  new CANNON.Vec3(-1, 0, 1),
            forwardRight: new CANNON.Vec3(1, 0, 1),
            backLeft:     new CANNON.Vec3(-1, 0, -1),
            backRight:    new CANNON.Vec3(1, 0, -1),
            upForward:  new CANNON.Vec3(0, 1, 1),
            upBackward: new CANNON.Vec3(0, 1, -1),
            upLeft:     new CANNON.Vec3(-1, 1, 0),
            upRight:    new CANNON.Vec3(1, 1, 0),
            downForward:  new CANNON.Vec3(0, -1, 1),
            downBackward: new CANNON.Vec3(0, -1, -1),
            downLeft:     new CANNON.Vec3(-1, -1, 0),
            downRight:    new CANNON.Vec3(1, -1, 0),
        };
        let results: {
            forward: RaycastResult | null,
            backward: RaycastResult | null,
            left: RaycastResult | null,
            right: RaycastResult | null,
            up: RaycastResult | null,
            down: RaycastResult | null,
        } = {};
        for (let dirName in directions) {
            const dir = directions[dirName];
            let worldDir = new CANNON.Vec3();
            carQuat.vmult(dir, worldDir);
            const from = rayStart.clone();
            const to = rayStart.vadd(worldDir.scale(rayLength));
            const ray = new CANNON.Ray(from, to);
            ray.intersectWorld(GameEngine.stage.world, {
                collisionFilterMask: -1,
                skipBackfaces: true,
            });
            this.drawRay(from, to, ray.hasHit)
            results[dirName] = ray.hasHit ? ray.result : null;
        }
        for (const [directionKey, raycastResult] of Object.entries(results)) {
            if (directionKey.includes('down')) { continue }
            if (raycastResult) {
                const hitNormal = raycastResult.hitNormalWorld;
                const carUp = new CANNON.Vec3(0, 1, 0);
                this.chassisBody.quaternion.vmult(carUp, carUp);
                const dot = hitNormal.dot(carUp);

                if (directionKey === 'up') {
                    const isUpsideDown = dot < 0.5;
                    if (isUpsideDown) {
                        const forceMagnitude = 1000; // tweak based on mass and bounce
                        const downVector = hitNormal.scale(-forceMagnitude);
                        this.chassisBody.applyForce(downVector, this.chassisBody.position);
                        console.log('car is upside down')
                    }
                } else {
                    const forceMagnitude = 200; // tweak based on mass and bounce
                    const downVector = hitNormal.scale(forceMagnitude);
                    this.chassisBody.applyForce(downVector, this.chassisBody.position);
                    console.log('car us pushed from side', directionKey)
                }
            }
        }
        return results;
    }
    drawRay(from, to, hit) {
        const lines = BABYLON.MeshBuilder.CreateLines("ray", {
            points: [
                new BABYLON.Vector3(from.x, from.y, from.z),
                new BABYLON.Vector3(to.x, to.y, to.z),
            ]
        }, GameEngine.scene);
        lines.color = hit ? BABYLON.Color3.Red() : BABYLON.Color3.Green();
        setTimeout(() => lines.dispose(), 1); // Dispose after 100ms
    }

    updateSafeStateIfGrounded() {
        const isOnGround = this.vehicle.numWheelsOnGround > 0;

        if (isOnGround) {
            this.lastSafeState.position.copy(this.chassisBody.position);
            this.lastSafeState.quaternion.copy(this.chassisBody.quaternion);
        }
    }
    checkAndResetIfFlipped() {
        const up = new CANNON.Vec3(0, 1, 0);
        const carUp = new CANNON.Vec3();
        this.chassisBody.quaternion.vmult(up, carUp);

        // If dot < 0.3, car is significantly upside down
        if (carUp.dot(up) < 0.5 && !this.lastSafeState.hasReseted) {
            console.log("Flipped! Resetting...");
            this.chassisBody.position.copy(this.lastSafeState.position);
            this.chassisBody.position.y += 10;
            this.chassisBody.quaternion.set(0,0,0,0);
            this.chassisBody.velocity.setZero();
            this.chassisBody.angularVelocity.setZero();
            this.vehicle.wheelInfos.forEach((wheel, i) => {
                wheel.suspensionLength = wheel.suspensionRestLength;
                // wheel.raycastResult = null; // Clear old raycast result
                this.vehicle.updateWheelTransform(i);
            });
            this.lastSafeState.hasReseted = true
        }
    }

    // Sync Babylon.js meshes with Cannon.js physics
    updateGraphics() {
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

    update() {

        // Appliquer les contrôles
        this.engine.setThrottle(GameEngine.inputManager.keys.throttle);
        this.engine.update(1/60)

        if (GameEngine.stage.state === RunState.INIT) {
            this.vehicle.setBrake(100, 0)
            this.vehicle.setBrake(100, 1)
            this.vehicle.setBrake(100, 2)
            this.vehicle.setBrake(100, 3)
        } else {
            if (GameEngine.scene.activeCamera === GameEngine.cameraManager.gameCamera) {
                // steering
                if (GameEngine.inputManager.keys.steering < -GameEngine.inputManager.deadZoneMinX || GameEngine.inputManager.keys.steering > GameEngine.inputManager.deadZoneMinX) {
                    this.vehicle.setSteeringValue(GameEngine.inputManager.keys.steering * .5, 0);
                    this.vehicle.setSteeringValue(GameEngine.inputManager.keys.steering * .5, 2);
                } else {
                    this.vehicle.setSteeringValue(0, 0);
                    this.vehicle.setSteeringValue(0, 2);
                }
            }
        }



        // // remettre la voiture sur la piste
        // this.updateSafeStateIfGrounded()
        // this.checkAndResetIfFlipped()
        for (const wheel of this.wheels) {

            if (GameEngine.inputManager.keys.brake) {
                this.vehicle.setBrake(GameEngine.inputManager.keys.brake * this.breakForce, wheel.id);
                wheel.infos.frictionSlip = wheel.baseFriction - 0.5
            }
            if (GameEngine.inputManager.keys.handbrake) {
                if (!wheel.isFront) {
                    this.vehicle.setBrake(GameEngine.inputManager.keys.handbrake * this.breakForce * 2, wheel.id);
                    wheel.infos.frictionSlip = wheel.baseFriction - 2
                }
            }
            if (!GameEngine.inputManager.keys.handbrake || !GameEngine.inputManager.keys.brake) { wheel.infos.frictionSlip = wheel.baseFriction}

            wheel.update()
        }
        this.updateGraphics()
    }

}