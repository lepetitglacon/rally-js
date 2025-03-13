<script setup lang="ts">
import {onMounted, inject} from "vue";
import * as CANNON from "cannon-es";
import * as BABYLON from "@babylonjs/core";
import CannonDebugger from '@/lib/cannon-es-debugger-babylonjs/dist/cannon-es-debugger-babylonjs'

interface Game {
  scene: BABYLON.Scene,
  engine: BABYLON.Engine,
  canvas: HTMLCanvasElement,
}

const {scene} = inject<Game>('game')

onMounted(() => {
  window.CANNON = CANNON
  const physicsPlugin = new BABYLON.CannonJSPlugin();
  scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);

  const world = scene.getPhysicsEngine()?.getPhysicsPlugin()?.world as CANNON.World
  world.fixedStep(1/60)

  const cannonDebugger = new CannonDebugger(scene, world);
})

</script>

<template>

</template>

<style scoped>

</style>