<script setup>
import {TresCanvas, useTresContext, extend } from "@tresjs/core";
import {SRGBColorSpace} from "three";
import OrbitControls from "./components/OrbitControls.vue";
import Car from "./components/Car.vue";
import Map from "./components/Map.vue";
import CannonWorld from "./components/cannon/CannonWorld.vue";

</script>

<template>


  <TresCanvas shadows window-size :output-encoding="SRGBColorSpace" clear-color="#82DBC5">
    <TresPerspectiveCamera
        :args="[45, 1, 0.1, 10000]"
        :position="[50, 140, 50]"
        :look-at="[0, 120, 0]"
    />
    <TresAmbientLight :intensity="1" />
    <OrbitControls/>


    <CannonWorld/>

    <Suspense>
      <Map/>
    </Suspense>
    <Suspense>
      <Car/>
    </Suspense>
  </TresCanvas>

</template>

<style scoped>

</style>
