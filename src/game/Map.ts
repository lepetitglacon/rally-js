import GameEngine from "./GameEngine";
import * as CANNON from "cannon-es";
import * as BABYLON from "@babylonjs/core";
import CannonDebugger from '@/lib/cannon-es-debugger-babylonjs/dist/cannon-es-debugger-babylonjs'

import heightmap2 from '@/assets/gltf/france-besancon-bregille.glb?url'

export default class Map {
    world: CANNON.World;
    private cannonDebugger: CannonDebugger;
    public terrainMesh: BABYLON.Mesh
    public startMesh: BABYLON.Mesh

    constructor() {
        window.CANNON = CANNON
        const physicsPlugin = new BABYLON.CannonJSPlugin();
        GameEngine.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);

        const world = GameEngine.scene?.getPhysicsEngine()?.getPhysicsPlugin()?.world as CANNON.World
        world.fixedStep(1/60)
        this.world = world

        this.cannonDebugger = new CannonDebugger(GameEngine.scene, world);
    }

    async initAsync() {
        const heightMapContainer = await BABYLON.LoadAssetContainerAsync(heightmap2, GameEngine.scene);
        heightMapContainer.meshes[0].position.y -= 100;
        const entries = heightMapContainer.instantiateModelsToScene()
        for (const mesh of entries.rootNodes[0].getChildMeshes()) {

            switch (mesh.metadata.gltf.extras.type) {
                case 'Terrain': {
                    this.terrainMesh = mesh
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
                    this.world.addBody(body)
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
            }
        }
        console.log('map loaded')
    }

    update() {
        this.cannonDebugger.update()
    }
}