<script async setup>
import { useLoader } from '@tresjs/core'
import { TextureLoader } from 'three'
import { DoubleSide } from "three";
import * as THREE from "three";

const texture = await useLoader(TextureLoader, '/assets/heightmap/heightmap.png')
const map = await useLoader(TextureLoader, '/assets/heightmap/map.png')

const mapWidth = 1000
const geom = new THREE.PlaneGeometry(mapWidth, mapWidth, mapWidth, mapWidth)


</script>


<template>
  <TresMesh
      :geometry="geom"
      :rotation-x="Math.PI /2">
    <TresMeshPhongMaterial
        :map="map"
        :displacementMap="texture"
        :displacementScale="-mapWidth / 10"
        :side="DoubleSide"
    />
  </TresMesh>
</template>