<script setup>
import {useTresContext, extend, useRenderLoop} from "@tresjs/core";
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import * as THREE from "three";

extend({ OrbitControls })
const { onLoop } = useRenderLoop()
const { camera, renderer } = useTresContext()

const controls = new OrbitControls( camera.value, renderer.value.domElement );
controls.target = new THREE.Vector3(0, 120, 0)

onLoop(() => {
  controls.update()
})
</script>


<template>
</template>