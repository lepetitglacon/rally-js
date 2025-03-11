<script setup lang="ts">
import subaru from '@/assets/gltf/subaru.glb?url'
import heightmap from '@/assets/heightmap.png?url'
import heightmap2 from '@/assets/gltf/france-besancon-bregille.glb?url'

import {onMounted, onUnmounted} from "vue";
import * as BABYLON from "@babylonjs/core";
import * as CANNON from "cannon-es";
import {Quaternion} from "@babylonjs/core";
import type {WheelInfoOptions} from "objects/WheelInfo";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import CannonDebugger from '@/lib/cannon-es-debugger-babylonjs/dist/cannon-es-debugger-babylonjs'

const inputMap = {};

onMounted(async () => {
  const debug = false;

  const wheels: Wheel[] = [];

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
  const scene = new BABYLON.Scene(engine);
  scene.actionManager = new BABYLON.ActionManager(scene);
  // scene.useRightHandedSystem = true
  const meshDebugger = new BABYLON.PhysicsViewer(scene, 1)


  // BG
  // scene.environmentTexture = new BABYLON.HDRCubeTexture(hdrEnvironment, scene, 512);
  // scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  // scene.fogDensity = 0.002;
  // scene.fogColor = new BABYLON.Color3(0.8, 0.8, 0.9);

  const gameCamera = new BABYLON.UniversalCamera("gamecamera", new BABYLON.Vector3(10, 2, 0), scene);
  gameCamera.rotation.y -= Math.PI / 2
  gameCamera.rotation.x += 0.1

  const flyCamera = new BABYLON.FlyCamera("flycamera", new BABYLON.Vector3(10, 2, 0), scene)
  flyCamera.keysForward = [90]
  flyCamera.keysBackward = [83]
  flyCamera.keysUp = [32]
  flyCamera.keysDown = [16]
  flyCamera.keysLeft = [81]
  flyCamera.keysRight = [68]
  flyCamera.rollCorrect = 2

  window.addEventListener("keydown", (e) => {
    if (e.key === 'c') {
      scene.activeCamera?.detachControl()
      scene.activeCamera = scene.activeCamera === gameCamera ? flyCamera : gameCamera
      scene.activeCamera.attachControl()
    }
  });

  window.addEventListener("click", () => {
    if (scene.activeCamera === flyCamera) {
      canvas.requestPointerLock()
    }
  });

  // const bloom = new BABYLON.DefaultRenderingPipeline("bloom", true, scene, [scene.activeCamera]);
  // bloom.bloomEnabled = true;
  // bloom.bloomThreshold = 0.8;

  const hemisphereLight = new BABYLON.HemisphericLight("light",
      new BABYLON.Vector3(0, 1, 0), scene);
  hemisphereLight.intensity = 0.7;
  // const light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
  // light.position.y = 50
  // const shadowGenerator = new BABYLON.ShadowGenerator(2048, light, true, scene.activeCamera);
  // shadowGenerator.useContactHardeningShadow = true;

  /////// CANNON
  window.CANNON = CANNON
  const physicsPlugin = new BABYLON.CannonJSPlugin();
  scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);

  const world = scene?.getPhysicsEngine()?.getPhysicsPlugin()?.world as CANNON.World
  world.fixedStep(1/60)

  const cannonDebugger = new CannonDebugger(scene, world);

  /////// MAP
  const terrain = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
      "terrain",
      heightmap,
      {
        width: 500,
        height: 500,
        subdivisions: 200,
        minHeight: 0,
        maxHeight: 10,
        onReady: (mesh) => {
          mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
              mesh, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene
          );
          meshDebugger.showImpostor(mesh.physicsImpostor, mesh)
        },
      },
      scene
  );
  terrain.position.y -= 5
  terrain.receiveShadows = true

  /////// CAR
  const car = {
    shape: new CANNON.Vec3(2.5, .5, 1)
  }
  const chassisShape = new CANNON.Box(car.shape);
  const chassisBody = new CANNON.Body({ mass: 2000, type: CANNON.BODY_TYPES.STATIC  });
  chassisBody.addShape(chassisShape);
  chassisBody.position.set(0, 2, 0);
  // chassisBody.position.set(1015, 102, -990);
  world.addBody(chassisBody);

  const chassisMesh = BABYLON.MeshBuilder.CreateBox("chassis", {
    width: car.shape.x * 2,
    height: car.shape.y * 2,
    depth: car.shape.z * 2
  }, scene);
  const chassisMat = new BABYLON.StandardMaterial('car', scene)
  chassisMesh.material = chassisMat
  chassisMesh.material.alpha = .5

  const points1 = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(10, 0, 0)];
  const line1 = BABYLON.CreateGreasedLine(
      'lines1',
      {
        points: points1,
        widtsDistribution: BABYLON.GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_START,
      },
      {
        color: new BABYLON.Color3(1, 0, 0),
      },
      scene
  );

  registerBuiltInLoaders()
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
  const vehicle = new CANNON.RaycastVehicle({ chassisBody });
  vehicle.chassisBody.quaternion = vehicle.chassisBody.quaternion.mult(BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0,1,0), Math.PI / 2))
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

  /////// MAP
	const heightMapContainer = await BABYLON.LoadAssetContainerAsync(heightmap2, scene);
	heightMapContainer.meshes[0].position.y -= 100;
	const entries = heightMapContainer.instantiateModelsToScene()
	for (const mesh of entries.rootNodes[0].getChildMeshes()) {

    switch (mesh.metadata.gltf.extras.type) {
      case 'Terrain': {
        const vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        let indices = mesh.getIndices();
        let transformedPositions = [];
        let worldMatrix = mesh.getWorldMatrix();
        // faire pointer les indices (normals) vers le haut
        for (let i = 0; i < indices.length; i += 3) {
          // Swap the last two indices to reverse the triangle normal
          let temp = indices[i + 1];
          indices[i + 1] = indices[i + 2];
          indices[i + 2] = temp;
        }
        // appliquer la transformation du monde au trimesh pour qu'il corresponde à la mesh
        // sinon c'est décalé / pas scalé correctement
        for (let i = 0; i < vertices.length; i += 3) {
          let vertex = BABYLON.Vector3.TransformCoordinates(
              new BABYLON.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]),
              worldMatrix
          );
          transformedPositions.push(vertex.x, vertex.y, vertex.z);
        }
        const trimeshShape = new CANNON.Trimesh(transformedPositions, indices);
        const body = new CANNON.Body({
          mass: 0, // 0 = static object (Trimesh does not work well with dynamic objects)
          shape: trimeshShape
        });
        world.addBody(body)
        chassisBody.type = CANNON.BODY_TYPES.DYNAMIC
        break
      }
      case 'Road': {
        mesh.isVisible = false
        break
      }
      case 'Start': {
        chassisBody.position.copy(mesh.getAbsolutePosition())
        chassisBody.position.y += 2
        chassisBody.quaternion.copy(mesh.rotationQuaternion?.invert())
        // gameCamera.position.copyFrom(mesh.position)
        break
      }
    }
	}

  // Player Controls
  window.addEventListener("keydown", (evt) => inputMap[evt.key] = true);
  window.addEventListener("keyup", (evt) => inputMap[evt.key] = false);

  const cameraLerpSpeed = 0.1; // Adjust for faster/slower follow effect
  function getVehicleForwardDirection(body) {
    const quaternion = body.quaternion;
    const localForward = new CANNON.Vec3(-1, 0, 0); // Local forward direction
    const worldForward = new CANNON.Vec3();

    quaternion.vmult(localForward, worldForward); // Convert to world space
    return new BABYLON.Vector3(worldForward.x, worldForward.y, worldForward.z);
  }

  const speed: number = 10000
  scene.onBeforeRenderObservable.add(() => {
    cannonDebugger.update()
    chassisMesh.material.alpha = debug ? .5 : 0

    if (scene.activeCamera === gameCamera) {
      flyCamera.position.copyFrom(gameCamera.position)
      const forward = getVehicleForwardDirection(chassisBody);
      line1.setDirection(forward)
      line1.position.copyFrom(chassisMesh.position)

      const cameraOffset = forward.scale(-6).add(new BABYLON.Vector3(0, 2, 0));
      const targetPosition = chassisMesh.position.add(cameraOffset);
      scene.activeCamera.position = BABYLON.Vector3.Lerp(scene.activeCamera.position, targetPosition, cameraLerpSpeed);

      const lookAtTarget = BABYLON.Vector3.Lerp(scene.activeCamera.getTarget(), chassisMesh.position.add(forward.scale(5)), cameraLerpSpeed);
      scene.activeCamera.setTarget(lookAtTarget);

      if (inputMap["z"]) {
        vehicle.applyEngineForce(-speed, 0);
        vehicle.applyEngineForce(-speed, 2);
        vehicle.setBrake(0, 0)
        vehicle.setBrake(0, 2)
      }
      if (inputMap["s"]) {
        vehicle.setBrake(50, 0)
        vehicle.setBrake(50, 2)
        // vehicle.applyEngineForce(speed, 0);
        // vehicle.applyEngineForce(speed, 2);
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
      }
      if (!inputMap["q"] && !inputMap["d"]) {
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 2);
      }
    }

    // Sync Babylon.js meshes with Cannon.js physics
    chassisMesh.position.set(chassisBody.position.x, chassisBody.position.y, chassisBody.position.z)
    chassisMesh.rotationQuaternion = new BABYLON.Quaternion(chassisBody.quaternion.x, chassisBody.quaternion.y, chassisBody.quaternion.z, chassisBody.quaternion.w);

    for (const wheel of wheels) {
      wheel.update()
    }
  });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
})



onUnmounted(() => {
})

class Wheel {
  private params: CANNON.WheelInfoOptions;
  private vehicle: CANNON.RaycastVehicle;
  private mesh: BABYLON.Mesh;
  private shape: CANNON.Shape;
  private body: CANNON.Body;
  private id: number;
  private debugMesh: BABYLON.Mesh;
  private baseFriction: number;

  static wheelTransformQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0,-1,0), Math.PI / 2)
  static wheelMaterial = new CANNON.Material('wheel')

  constructor(params, vehicle, scene) {

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
    this.mesh.rotationQuaternion = new Quaternion()
    this.mesh.rotationQuaternion.multiplyInPlace(Wheel.wheelTransformQuaternion)

    this.debugMesh = BABYLON.MeshBuilder.CreateIcoSphere('', {
      radius: .35
    }, scene)
    this.debugMesh.material = new BABYLON.StandardMaterial('', scene)
    this.debugMesh.material.alpha = 0
    this.debugMesh.rotationQuaternion = new Quaternion()

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
    this.vehicle.updateWheelTransform(this.id);

    const wheelInfos = this.vehicle.wheelInfos[this.id];

    // update la friction en fonction de la vitesse
    let speed = this.vehicle.chassisBody.velocity.length();
    let friction = this.baseFriction * Math.max(0.5, 1 - (speed / 100));
    friction = Math.max(friction, 0.2);
    wheelInfos.frictionSlip = friction;

    if (inputMap["z"]) {
      if (wheelInfos.isFrontWheel) {
        wheelInfos.frictionSlip = friction - 0.2
      }
    }
    if (inputMap["s"]) {
      if (wheelInfos.isFrontWheel) {
        wheelInfos.frictionSlip = this.baseFriction
      }
    }

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

</script>

<template>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
</style>

<style>
</style>
