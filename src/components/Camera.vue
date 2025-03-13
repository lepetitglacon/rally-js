<script setup lang="ts">
import {onMounted, inject} from "vue";
import * as CANNON from "cannon-es";
import * as BABYLON from "@babylonjs/core";

const {scene} = inject('game')
console.log(camera)

const flyCamera = new BABYLON.FlyCamera("flycamera", new BABYLON.Vector3(10, 2, 0), scene)
flyCamera.keysForward = [90]
flyCamera.keysBackward = [83]
flyCamera.keysUp = [32]
flyCamera.keysDown = [16]
flyCamera.keysLeft = [81]
flyCamera.keysRight = [68]
flyCamera.rollCorrect = 2

</script>

<template>

</template>

<style scoped>

</style>