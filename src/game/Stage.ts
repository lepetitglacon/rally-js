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
                    this.world.addBody(this.buildTerrainAsTrimesh(mesh))
                    // this.world.addBody(this.buildTerrainAsConvexShape(mesh))
                    // this.world.addBody(this.buildTerrainAsHeightfieldRectangular(mesh, 100, 100))
                    // this.world.addBody(this.buildTerrainAsHeightfield(mesh))
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

        GameEngine.eventManager.onStageLoaded.notifyObservers({
            terrainMesh: this.terrainMesh,
            startMesh: this.startMesh,
            endMesh: this.endMesh,
            checkpoints: this.runCheckpoints,
        })
        console.log('map loaded')
    }
    buildTerrainAsHeightfieldRectangular(mesh: BABYLON.Mesh, rows: number, columns: number): CANNON.Body {
        const vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const worldMatrix = mesh.getWorldMatrix();

        // Validate vertex count
        if (vertices.length / 3 !== rows * columns) {
            throw new Error(`Vertex count ${vertices.length/3} does not match rows*columns (${rows}*${columns})`);
        }

        // Build height matrix rows x columns
        const heights: number[][] = [];
        for (let row = 0; row < rows; row++) {
            heights[row] = [];
            for (let col = 0; col < columns; col++) {
                const idx = (row * columns + col) * 3;
                const vertex = new BABYLON.Vector3(vertices[idx], vertices[idx + 1], vertices[idx + 2]);
                const transformed = BABYLON.Vector3.TransformCoordinates(vertex, worldMatrix);
                heights[row][col] = transformed.y;
            }
        }

        // Calculate element size (assumes uniform spacing in X and Z directions)
        // Let's calculate element sizeX between first two columns of first row:
        const p0 = new BABYLON.Vector3(vertices[0], vertices[1], vertices[2]);
        const p1 = new BABYLON.Vector3(vertices[3], vertices[4], vertices[5]);
        const p0w = BABYLON.Vector3.TransformCoordinates(p0, worldMatrix);
        const p1w = BABYLON.Vector3.TransformCoordinates(p1, worldMatrix);
        const elementSizeX = Math.abs(p1w.x - p0w.x);

        // Calculate element sizeZ between first two rows of first column:
        // Check vertex at row 0, col 0 and row 1, col 0
        const p2 = new BABYLON.Vector3(vertices[columns * 3], vertices[columns * 3 + 1], vertices[columns * 3 + 2]);
        const p2w = BABYLON.Vector3.TransformCoordinates(p2, worldMatrix);
        const elementSizeZ = Math.abs(p2w.z - p0w.z);

        // For CANNON.Heightfield, elementSize is square, so pick average or smaller
        const elementSize = Math.min(elementSizeX, elementSizeZ);

        // Create Heightfield shape
        const heightfieldShape = new CANNON.Heightfield(heights, { elementSize });

        // Create static body
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(heightfieldShape);

        // Position the heightfield body at mesh minimum corner (X,Z), Y can be min Y or 0
        const meshBoundingInfo = mesh.getBoundingInfo();
        const min = meshBoundingInfo.minimumWorld;

        // Important: Heightfield height data is relative to body.position.y
        // So if min.y is not zero, you can adjust accordingly or offset heights
        body.position.set(min.x, min.y, min.z);

        return body;
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

    buildTerrainAsHeightfield(mesh: BABYLON.Mesh): CANNON.Body {
        const vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const worldMatrix = mesh.getWorldMatrix();
        const vertexCount = vertices.length / 3;
        const gridSize = Math.sqrt(vertexCount);
        if (!Number.isInteger(gridSize)) {
            throw new Error("Mesh vertices count is not a perfect square, cannot build Heightfield.");
        }
        // Transform all vertices to world space and organize heights into 2D matrix
        const heights: number[][] = [];
        for (let row = 0; row < gridSize; row++) {
            heights[row] = [];
            for (let col = 0; col < gridSize; col++) {
                // Index in flat array
                const i = (row * gridSize + col) * 3;
                const vertex = new BABYLON.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
                const transformed = BABYLON.Vector3.TransformCoordinates(vertex, worldMatrix);

                // We build matrix by heights in Y axis
                heights[row][col] = transformed.y;
            }
        }

        // Calculate element size (distance between points in X and Z)
        // Assuming uniform spacing, calculate difference between first two points in X and Z axis
        const p0 = new BABYLON.Vector3(vertices[0], vertices[1], vertices[2]);
        const p1 = new BABYLON.Vector3(vertices[3], vertices[4], vertices[5]);
        const p0w = BABYLON.Vector3.TransformCoordinates(p0, worldMatrix);
        const p1w = BABYLON.Vector3.TransformCoordinates(p1, worldMatrix);

        const elementSizeX = Math.abs(p1w.x - p0w.x);
        // We assume element size is uniform, same for Z spacing (could check another point)
        const elementSize = elementSizeX;

        // Create heightfield shape
        const heightfieldShape = new CANNON.Heightfield(heights, { elementSize });

        // Create static body for terrain
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(heightfieldShape);

        // Position the heightfield body correctly (based on mesh bounding info)
        // Heightfield by default is positioned at (0,0,0), you might want to adjust it:

        const meshBoundingInfo = mesh.getBoundingInfo();
        const min = meshBoundingInfo.minimumWorld;
        // Position at bottom-left corner in X,Z (Y ignored because heights already used)
        body.position.set(min.x, min.y, min.z);

        return body;
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
            if (distanceToCheckpoint < 20) {this.currentSegmentIndex++}
            GameEngine.eventManager.onNextWaypoint.notifyObservers({
                index: this.currentSegmentIndex,
                waypoint: closestCheckpoint,
                distance: distanceToCheckpoint,
                totalDistanceBetweenPoints: BABYLON.Vector3.Distance(closestCheckpoint, this.runCheckpoints[this.currentSegmentIndex - 1] ?? this.startMesh.absolutePosition)
            })
            // console.log(this.runCheckpoints.indexOf(closestCheckpoint), distanceToCheckpoint)
        }


    }
}