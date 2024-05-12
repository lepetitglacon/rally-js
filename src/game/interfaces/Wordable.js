import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default class Wordable {

    constructor(options = {}) {
        this.meshGeometry = options.geometry ?? new THREE.BoxGeometry(1)
        this.meshMaterial = options.meshMaterial ?? new THREE.MeshPhongMaterial()
        this.mesh = options.mesh ?? new THREE.Mesh(this.meshGeometry, this.meshMaterial)

        this.bodyShape = options.shape ?? new CANNON.Box(new CANNON.Vec3(.5, .5, .5))
        this.bodyMaterial = options.meshMaterial ?? new THREE.MeshPhongMaterial()
        this.body = options.body ?? new CANNON.Body({
            shape: this.bodyShape,
            mass: options.bodyMass,
            material: options.bodyMaterial
        })
    }

    addToWorld(scene, world) {
        scene.add(this.mesh);
        world.addBody(this.body);
        console.log('added to world', this)
    }
}