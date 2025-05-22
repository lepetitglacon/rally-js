import GameEngine from "./GameEngine";
import * as CANNON from "cannon-es";
import * as BABYLON from "@babylonjs/core";
import CannonDebugger from '@/lib/cannon-es-debugger-babylonjs/dist/cannon-es-debugger-babylonjs'

import heightmap2 from '@/assets/gltf/france-besancon-bregille.glb?url'
import {type Mesh, Vector3} from "@babylonjs/core";

export enum RunState {
    INIT,
    COUNTDOWN,
    RUNNING,
    FINISHED,
}

export default class Stage {
    world: CANNON.World;
    private cannonDebugger: CannonDebugger;
    public terrainMesh: BABYLON.Mesh
    public startMesh: BABYLON.Mesh
    public endMesh: BABYLON.Mesh
    public checkpoints: Array<BABYLON.Mesh>
    public nextCheckpointId: number;
    private runMesh: BABYLON.Mesh;
    private distanceToNextCheckpoint: number;
    private currentSegmentIndex: number;
    private runCheckpoints: Vector3[];
    public state: RunState;

    constructor() {
        window.CANNON = CANNON
        const physicsPlugin = new BABYLON.CannonJSPlugin();
        GameEngine.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);

        this.state = RunState.INIT
        GameEngine.eventManager.onUserHandBreakForTheFirstTime.add(() => this.state = RunState.COUNTDOWN)
        GameEngine.eventManager.onRunStart.add(() => this.state = RunState.RUNNING)
        GameEngine.eventManager.onRunEnd.add(() => this.state = RunState.FINISHED)

        this.checkpoints = []
        this.nextCheckpointId = 0

        const world = GameEngine.scene?.getPhysicsEngine()?.getPhysicsPlugin()?.world as CANNON.World
        world.fixedStep(1/60)
        this.world = world

        this.cannonDebugger = new CannonDebugger(GameEngine.scene, world);

        this.currentSegmentIndex = 0
        this.distanceToNextCheckpoint = 0
        this.runCheckpoints = [
            new Vector3(-736.9297219037641, 3.9353806576531767, -802.11594249486),
            new Vector3(-198.93117798038048, 3.5689503644881455, -416.0637972999927),
            new Vector3(-475.10137456275504, 33.26579284667969, -175.15615786800936),
            new Vector3(-236.42653542168452, 8.856447292461652, 30.123879840914423),
            new Vector3(247.9096393142646, -25.37496746601772, 62.01336948616621),
        ]
        let i = 0
        for (const runCheckpoint of this.runCheckpoints) {
            console.log(i)
            const sphere = BABYLON.MeshBuilder.CreateSphere("sphere" + i++, {diameter: 1}, GameEngine.scene)
            sphere.position.copyFrom(runCheckpoint)
            sphere.isVisible = true
        }
    }

    async initAsync() {
        const heightMapContainer = await BABYLON.LoadAssetContainerAsync(heightmap2, GameEngine.scene);
        heightMapContainer.meshes[0].position.y -= 100;
        const entries = heightMapContainer.instantiateModelsToScene()
        for (const mesh of entries.rootNodes[0].getChildMeshes()) {

            switch (mesh.metadata.gltf.extras.type) {
                case 'Terrain': {
                    this.terrainMesh = mesh
                    // this.world.addBody(this.buildTerrainAsConvexShape(mesh))
                    this.world.addBody(this.buildTerrainAsTrimesh(mesh))
                    break
                }
                case 'Road': {
                    mesh.isVisible = false
                    break
                }
                case 'Start': {
                    this.startMesh = mesh
                    // chassisBody.position.copy(mesh.getAbsolutePosition())
                    // chassisBody.position.y += 1
                    // chassisBody.quaternion.copy(mesh.rotationQuaternion?.invert())
                    // gameCamera.position.copyFrom(mesh.position)
                    break
                }
                // case 'Checkpoint': {
                //     this.checkpoints.push(mesh)
                //     break;
                // }
                // case 'End': {
                //     this.endMesh = mesh
                //     this.checkpoints.push(mesh)
                //     break
                // }
            }
        }
        console.log('map loaded')

    }

    buildTerrainAsTrimesh(mesh: Mesh) {
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
        return body
    }

    buildTerrainAsConvexShape(mesh: Mesh) {
        const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const indices = mesh.getIndices();
        const worldMatrix = mesh.getWorldMatrix();

        let vertexMap = new Map();
        let uniqueVertices = [];
        let faces = [];

        for (let i = 0; i < indices.length; i += 3) {
            let face = [];

            for (let j = 0; j < 3; j++) {
                const idx = indices[i + j] * 3;
                const localVertex = new BABYLON.Vector3(
                    positions[idx],
                    positions[idx + 1],
                    positions[idx + 2]
                );
                const worldVertex = BABYLON.Vector3.TransformCoordinates(localVertex, worldMatrix);
                const key = `${worldVertex.x.toFixed(5)},${worldVertex.y.toFixed(5)},${worldVertex.z.toFixed(5)}`;

                let vertexIndex;
                if (vertexMap.has(key)) {
                    vertexIndex = vertexMap.get(key);
                } else {
                    vertexIndex = uniqueVertices.length;
                    vertexMap.set(key, vertexIndex);
                    uniqueVertices.push(new CANNON.Vec3(worldVertex.x, worldVertex.y, worldVertex.z));
                }

                face.push(vertexIndex);
            }

            // Only push valid triangular faces
            if (face.length === 3 && new Set(face).size === 3) {
                faces.push(face);
            }
        }

        const convexShape = new CANNON.ConvexPolyhedron({
            vertices: uniqueVertices,
            faces: faces,
        });

        const body = new CANNON.Body({
            mass: 0, // static
            shape: convexShape
        });
        return body
    }

    findNearestPointOnCurve(carPosition: Vector3, curvePoints: Vector3[]) {
        let nearest = null;
        let minDist = Infinity;
        for (const p of curvePoints) {
            const dist = BABYLON.Vector3.Distance(carPosition, p);
            if (dist < minDist) {
                minDist = dist;
                nearest = p;
            }
        }
        return nearest;
    }

    update() {
        this.cannonDebugger.update()

        const availableCheckpoints = this.runCheckpoints.filter((el, i) => i >= this.currentSegmentIndex)
        if (availableCheckpoints.length === 0) {
            if (this.state !== RunState.FINISHED) { GameEngine.eventManager.onRunEnd.notifyObservers({}) }
        } else {
            let closestCheckpoint = this.findNearestPointOnCurve(GameEngine.car.chassisMesh.position, availableCheckpoints)
            let distanceToCheckpoint = BABYLON.Vector3.Distance(closestCheckpoint, GameEngine.car.chassisMesh.position)
            if (distanceToCheckpoint < 20) { this.currentSegmentIndex++ }
            // console.log(this.runCheckpoints.indexOf(closestCheckpoint), distanceToCheckpoint)
        }


    }
}