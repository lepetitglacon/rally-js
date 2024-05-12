import * as THREE from "three";
import {OrbitControls} from "three/addons";

export default class Three {

    constructor({engine}) {
        this.engine = engine
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.engine.ui.gameDiv.appendChild( this.renderer.domElement );
        this.engine.ui.rootDiv.appendChild(this.engine.ui.gameDiv);

        this.camera.position.z = 5
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );


        this.ambiantLight = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
        this.scene.add( this.ambiantLight );

        this.animate();
    }
    
    animate() {
        requestAnimationFrame( () => this.animate() );
        this.engine.dispatchEvent(new CustomEvent('three/render/beforeAnimate'))

        this.controls.update()

        this.engine.dispatchEvent(new CustomEvent('three/render/animate'))

        this.renderer.render( this.scene, this.camera );
        this.engine.dispatchEvent(new CustomEvent('three/render/afterAnimate'))
    }
}