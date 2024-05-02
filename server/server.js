import { Worker }  from 'node:worker_threads'
import * as THREE from 'three'
import NodeThreeExporter from '@injectit/threejs-nodejs-exporters'
import fs from 'fs'
import {Box3} from "three";

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
let intersects = null;

exporter.parse('glb', file, model => {
    for (const mesh of model.scene.children) {
        switch (mesh.userData.type) {
            case 'Terrain':

                const mapAABB = new Box3().setFromObject(mesh)
                const mapWidth = mapAABB.max.x - mapAABB.min.x
                const mapDepth = mapAABB.max.z - mapAABB.min.z
                const mapHeight = mapAABB.max.y - mapAABB.min.y
                const mapRatio = mapWidth / mapDepth
                raycaster.far = mapHeight + 1
                console.log(mapWidth, mapHeight, mapDepth, mapRatio)

                const numberOfChunksX = mapWidth / chunkWidth
                const numberOfChunksZ = mapDepth / chunkWidth
                console.log(numberOfChunksX, numberOfChunksZ)

                for (let i = 0; i < numberOfChunksZ; i++) {
                    for (let j = 0; i < numberOfChunksX; i++) {
                        const heightmap = []
                        for (let x = 0; x < chunkWidth; x++) {
                            heightmap[x] = []
                            for (let z = 0; z < chunkWidth; z++) {
                                raycasterOrigin.set(chunkCount * x * chunkSpacing, mapAABB.max.y + 1, chunkCount * z * chunkSpacing)
                                intersects = raycaster.intersectObject(mesh, false);
                                if (intersects.length > 0) {
                                    const hitPoint = intersects[0].point;
                                    const height = hitPoint.y;
                                    console.log(chunkCount, x, z, height)
                                    heightmap[x][z] = height
                                }
                            }
                        }
                        chunkCount++
                        console.log(heightmap)
                        const filename = 'chunk_' + chunkCount + '.json'
                        fs.writeFileSync('./server/data/' + filename, JSON.stringify(heightmap, null, 2))
                    }
                }





                break;
        }
    }
})

