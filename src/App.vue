<script setup>
import {TresCanvas, useTresContext, extend } from "@tresjs/core";
import {SRGBColorSpace} from "three";
import OrbitControls from "./components/OrbitControls.vue";
import Car from "./components/Car.vue";
import Map from "./components/Map.vue";


</script>

<template>


  <TresCanvas shadows window-size :output-encoding="SRGBColorSpace" clear-color="#82DBC5">
    <TresPerspectiveCamera
        :position="[3, 3, 3]"
        :look-at="[0, 0, 0]"
    />
    <TresAmbientLight :intensity="1" />




    <OrbitControls/>
    <Suspense>
      <Car/>
    </Suspense>
    <Suspense>
      <Map/>
    </Suspense>

    <TresMesh>
      <TresTorusGeometry :args="[1, 0.5, 16, 32]" />
      <TresMeshBasicMaterial color="orange" />
    </TresMesh>
  </TresCanvas>

</template>

<style scoped>

</style>
