<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import GameEngine, {scene} from "@/game/GameEngine.ts";

onMounted(async () => {
	console.log(scene)
	GameEngine.init()
	console.log(scene)
})
onUnmounted(() => {
	GameEngine.dispose()
})
</script>

<template>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
</style>

<style>
</style>
