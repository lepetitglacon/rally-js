<script setup>
import {useTresContext, extend } from "@tresjs/core";
import { OrbitControls } from 'three/addons/controls/OrbitControls'


extend({ OrbitControls })
const { camera, renderer } = useTresContext()

</script>


<template>
  <TresOrbitControls
      v-if="renderer"
      :args="[camera, renderer?.domElement]"
  />
</template>