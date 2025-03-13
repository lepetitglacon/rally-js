<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import GameEngine from "@/game/GameEngine";

onMounted(async () => {
  GameEngine.init()
})
onUnmounted(() => {

})
</script>

<template>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
</style>

<style>
</style>
