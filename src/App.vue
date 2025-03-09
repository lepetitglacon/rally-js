<script setup>

import {onMounted, onUnmounted} from "vue";
import * as BABYLON from "@babylonjs/core";
import * as CANNON from "cannon-es";
import heightmap from '@/assets/heightmap.png?url'
import {Inspector} from "@babylonjs/inspector";
import {Quaternion} from "@babylonjs/core";

onMounted(() => {
  const inputMap = {};
  const canvas = document.getElementById("canvas");
  const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
  const scene = new BABYLON.Scene(engine);
  scene.actionManager = new BABYLON.ActionManager(scene);
  var physicsHelper = new BABYLON.PhysicsHelper(scene);
  const camera = new BABYLON.UniversalCamera("flycamera", new BABYLON.Vector3(10, 2, 0), scene);
  camera.rollCorrect = 2
  camera.rotation.y -= Math.PI / 2
  camera.rotation.x += 0.1
  console.log(camera.rotation)
  const light = new BABYLON.HemisphericLight("light",
      new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  /////// CANNON
  window.CANNON = CANNON
  const physicsPlugin = new BABYLON.CannonJSPlugin();
  scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);

  const world = scene.getPhysicsEngine().getPhysicsPlugin().world
  world.dt = 1/60

  const terrain = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
      "terrain",
      heightmap,
      {
        width: 200,
        height: 200,
        subdivisions: 500,
        minHeight: 0,
        maxHeight: 10,
        onReady: (mesh) => {
          mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
              mesh, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene
          );
        },
      },
      scene
  );
  terrain.position.y -= 5

  // Create Car Body (Chassis)
  const car = {
    shape: new CANNON.Vec3(2, .5, 1)
  }
  const chassisShape = new CANNON.Box(car.shape);
  const chassisBody = new CANNON.Body({ mass: 20 });
  chassisBody.addShape(chassisShape);
  chassisBody.position.set(0, 10, 0);
  world.addBody(chassisBody);

  const chassisMesh = BABYLON.MeshBuilder.CreateBox("chassis", {
    width: car.shape.x * 2,
    height: car.shape.y * 2,
    depth: car.shape.z * 2
  }, scene);
  camera.parent = chassisMesh

// Create Raycast Vehicle
  const vehicle = new CANNON.RaycastVehicle({ chassisBody });
  vehicle.chassisBody.quaternion = vehicle.chassisBody.quaternion.mult(BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0,1,0), Math.PI / 2))

  const wheelOptions = {
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    maxSuspensionForce: 10000,
    frictionSlip: 3,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
  };

// Add 4 wheels
  const xOffset = 1.5
  const zOffset = 1
  const wheelPositions = [
    new CANNON.Vec3(-xOffset, -0.5, zOffset), // Front-left
    new CANNON.Vec3(xOffset, -0.5, zOffset),  // Rear-left
    new CANNON.Vec3(-xOffset, -0.5, -zOffset), // Front-right
    new CANNON.Vec3(xOffset, -0.5, -zOffset)  // Rear-right
  ];

  wheelPositions.forEach(pos => {
    wheelOptions.chassisConnectionPointLocal = pos;
    vehicle.addWheel(wheelOptions);
  });

// Add vehicle to world
  vehicle.addToWorld(world);

// Create wheel meshes
  const wheelTransformQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(1,0,0), Math.PI / 2)
  const wheelMeshes = wheelPositions.map(() => {
    const wheel = BABYLON.MeshBuilder.CreateIcoSphere("wheel", {
      // diameter: 1,
      // height: 0.5
      radius: 0.5,
      subdivisions: 2
    }, scene);
    wheel.rotationQuaternion = new Quaternion()
    wheel.rotationQuaternion.multiplyInPlace(wheelTransformQuaternion)
    return wheel;
  });


  // Player Controls
  window.addEventListener("keydown", (evt) => inputMap[evt.key] = true);
  window.addEventListener("keyup", (evt) => inputMap[evt.key] = false);

  console.log(world)
  scene.onBeforeRenderObservable.add(() => {

    if (inputMap["z"]) {
      vehicle.applyEngineForce(-200, 1);
      vehicle.applyEngineForce(-200, 3);
    }
    if (inputMap["s"]) {
      vehicle.applyEngineForce(100, 1);
      vehicle.applyEngineForce(100, 3);
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
      vehicle.applyEngineForce(0, 1);
      vehicle.applyEngineForce(0, 3);
    }
    if (!inputMap["q"] && !inputMap["d"]) {
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 2);
    }

    // Sync Babylon.js meshes with Cannon.js physics
    chassisMesh.position.set(chassisBody.position.x, chassisBody.position.y, chassisBody.position.z)
    chassisMesh.rotationQuaternion = new BABYLON.Quaternion(chassisBody.quaternion.x, chassisBody.quaternion.y, chassisBody.quaternion.z, chassisBody.quaternion.w);

    vehicle.updateVehicle(1/60)
    // Update wheel positions
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      vehicle.updateWheelTransform(i);
      const t = vehicle.wheelInfos[i].worldTransform;
      wheelMeshes[i].position.set(t.position.x, t.position.y, t.position.z);
      wheelMeshes[i].rotationQuaternion.copyFromFloats(t.quaternion.x, t.quaternion.y, t.quaternion.z, t.quaternion.w)
      wheelMeshes[i].rotationQuaternion.multiplyInPlace(wheelTransformQuaternion)
    }
  });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
  window.addEventListener("click", () => canvas.requestPointerLock());
})

onUnmounted(() => {
})

</script>

<template>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
</style>

<style>
</style>
