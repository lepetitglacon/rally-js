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
                const mapRatio = mapWidth / mapDepth
                console.log(mapWidth, mapDepth, mapRatio)

                const numberOfChunksX = mapWidth / chunkWidth
                const numberOfChunksZ = mapDepth / chunkWidth

                for (let i = 0; i < numberOfChunksZ; i++) {
                    for (let j = 0; i < numberOfChunksX; i++) {
                        // TODO écrire un fichier par chunk contenant un tableau de height
                        // TODO rajouter des for

                        intersects = raycaster.intersectObject(mesh);
                        if (intersects.length > 0) {
                            const hitPoint = intersects[0].point;
                            const height = hitPoint.y;
                        }
                    }
                }





                break;
        }
    }
})