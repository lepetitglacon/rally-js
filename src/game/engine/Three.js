import * as THREE from "three";
import {OrbitControls} from "three/addons";

export default class Three {

    constructor({engine}) {
        this.engine = engine
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 10000 );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.camera.position.z = 5
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );


        this.ambiantLight = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
        this.scene.add( this.ambiantLight );

        this.clock = new THREE.Clock()
        this.targetFPS = 60;
        this.targetFrameTime = 1 / this.targetFPS;
        this.animate();
    }
    
    animate() {
        requestAnimationFrame( () => this.animate() );
        if (this.clock.getElapsedTime() >= this.targetFrameTime) {
            this.clock.start()

            this.controls.update()

            this.engine.dispatchEvent(new CustomEvent('three/render/beforeAnimate'))

            this.engine.dispatchEvent(new CustomEvent('three/render/animate'))

            this.engine.dispatchEvent(new CustomEvent('three/render/afterAnimate'))
            this.renderer.render( this.scene, this.camera );
        }
    }
}