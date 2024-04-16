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
        :position="[50, 300, 50]"
        :look-at="[0, 0, 0]"
    />
    <TresAmbientLight :intensity="1" />
    <CannonWorld/>



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
