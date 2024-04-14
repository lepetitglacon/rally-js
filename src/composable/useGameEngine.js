import * as THREE from "three";
import {computed, ref, onMounted} from "vue";
import {useGamepad} from "@vueuse/core";

const { isSupported, gamepads, onConnected, onDisconnected } = useGamepad()

class GameEngine {

    constructor() {

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer();

        this.gameElement = ref(null)
        console.log(this.gameElement)

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );

        const gamepad = {
            rotation: 0,
            accelerator: 0,
            break: 0,
            clutch: 0,
        }

        function animate() {
            // requestAnimationFrame( animate );
            //
            // cube.rotation.x += 0.01;
            // cube.rotation.y += 0.01;
            //
            // this.renderer.render( this.scene, this.camera );
        }

        animate();
    }

    startThree(threeRoot) {
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        threeRoot.value.appendChild( this.renderer.domElement );
    }
}

export const gameEngine = new GameEngine()