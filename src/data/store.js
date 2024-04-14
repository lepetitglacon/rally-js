// stores/counter.js
import { defineStore } from 'pinia'
import * as THREE from "three";

export const useThreeStore = defineStore('three', {
    state: () => ({
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
        renderer: new THREE.WebGLRenderer()
    }),
    actions: {
        // increment() {
        //     this.count++
        // },
    },
})