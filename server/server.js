import { Worker }  from 'node:worker_threads'
import * as THREE from 'three'
import NodeThreeExporter from '@injectit/threejs-nodejs-exporters'
import fs from 'fs'
import {Box3} from "three";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// Add the extension functions
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

// const worker = new Worker('./server/worker.js', {
//     workerData: JSON.stringify(mesh)
// });

const file = fs.readFileSync('./public/assets/models/map.glb')
const exporter = new NodeThreeExporter()

const chunkWidth = 32
let chunkCount = 0
const chunkSpacing = 1

const raycasterOrigin = new THREE.Vector3();
const directionDown = new THREE.Vector3(0, -1, 0);
const raycaster = new THREE.Raycaster(raycasterOrigin, directionDown);
raycaster.firstHitOnly = true;
let intersects = null;

exporter.parse('glb', file, model => {
    for (const mesh of model.scene.children) {
        switch (mesh.userData.type) {
            case 'Terrain':
                mesh.material.side = THREE.FrontSide

                const mapAABB = new Box3().setFromObject(mesh)
                const mapWidth = mapAABB.max.x - mapAABB.min.x
                const mapDepth = mapAABB.max.z - mapAABB.min.z
                const mapHeight = mapAABB.max.y - mapAABB.min.y
                const mapRatio = mapWidth / mapDepth
                raycaster.far = mapHeight + 1
                console.log(mapWidth, mapHeight, mapDepth, mapRatio)

                mesh.position.x -= mapAABB.min.x + 1
                mesh.position.z -= mapAABB.min.z + 1
                mesh.position.y -= mapAABB.min.y + 1
                const mapAABBReplaced = new Box3().setFromObject(mesh)
                console.log(mapAABBReplaced)

                const numberOfChunksX = mapWidth / chunkWidth
                const numberOfChunksZ = mapDepth / chunkWidth
                console.log(numberOfChunksX, numberOfChunksZ)

                //points in chunk
                const heightmap = []
                chunkLoop: for (let x = 0; x < mapWidth - 1; x++) {
                    heightmap[x] = []
                    for (let z = 0; z < mapDepth - 1; z++) {
                        let perfs = performance.now()
                        raycasterOrigin.set(x * chunkSpacing, mapAABBReplaced.max.y + 1, z * chunkSpacing)
                        intersects = raycaster.intersectObject(mesh, false);
                        if (intersects.length > 0) {
                            heightmap[x][z] = Math.round(intersects[0]?.point?.y) ?? 0
                        } else {
                            console.log('finished at ', x, z)
                            break chunkLoop
                        }
                        let perfe = performance.now()
                        // console.log(perfe - perfs)
                    }
                    console.log('row ', x)
                }
                console.log(heightmap)
                const filename = 'heightmap.json'
                fs.writeFileSync('./server/data/' + filename, JSON.stringify(heightmap, null, 2))

                break;
        }
    }
})

