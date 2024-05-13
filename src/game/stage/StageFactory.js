import Stage from "./Stage.js";
import * as THREE from "three";
import * as CANNON from "cannon-es";

import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export default class StageFactory {

    static STAGE_OFFSET = -250

    constructor({engine}) {
        this.engine = engine;
        this.gltfLoader = new GLTFLoader();
        this.cubeTextureLoader = new THREE.CubeTextureLoader();

        this.buildingMaterial = new THREE.MeshStandardMaterial()
    }

    /**
     *
     * @param mapName
     * @param options
     * @returns {Promise<Stage>}
     */
    async getStage(mapName, options = {}) {
        const stage = new Stage({engine: this.engine});

        // MODEL
        const gltf = await this.gltfLoader.loadAsync(
            `stages/${mapName}/model/${mapName}.glb`,
            (xhr) => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            }
        )
        gltf.scene.position.y += StageFactory.STAGE_OFFSET * 2 + 11
        gltf.scene.traverse((object) => {
            if (object.material) {
                object.material.side = THREE.FrontSide
                if (object.userData.type !== 'Terrain' && object.userData.type !== 'Road') {
                    object.material = this.buildingMaterial
                }
            }
            if (object.userData.type === 'Start') {
                stage.startingPoints.push(object.position.clone())
                stage.startingPoints[stage.startingPoints.length - 1].y += StageFactory.STAGE_OFFSET * 2 + 11
                console.log('start point found')
            }
            if (object.userData.type === 'Road') {
                object.visible = false
            }
        })
        console.log('model ok')

        // HEIGHTMAP
        // TODO faire un worker pour charger la map
        const heightmap_json_res = await fetch(`stages/${mapName}/heightmap/heightmap.json`)
        const heightmap_json = await heightmap_json_res.json()
        const heightmapShape = new CANNON.Heightfield(heightmap_json.map(row => row.reverse()))
        const heightmap = new CANNON.Body({ shape: heightmapShape })
        heightmap.position.x -= heightmap_json.length / 2 - 20
        heightmap.position.y += StageFactory.STAGE_OFFSET
        heightmap.position.z += heightmap_json[0].length / 2 - 115
        heightmap.shapeOrientations[0].setFromEuler(-Math.PI/2, 0, 0)
        console.log('heightmap ok')

        // SKYBOX
        this.cubeTextureLoader.setPath(`stages/${mapName}/skybox/`)
        this.stageSkybox = this.cubeTextureLoader.load([
            'right.jpg', 'left.jpg',
            'top.jpg', 'bottom.jpg',
            'back.jpg', 'front.jpg',
        ])
        this.engine.three.scene.background = this.stageSkybox
        console.log('skybox ok')

        stage.mesh = gltf.scene
        stage.body = heightmap

        return stage
    }

}