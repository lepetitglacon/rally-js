<script setup>
import {onMounted, ref, computed} from 'vue'
import VueSpeedometer from "vue-speedometer/slim"
import { useThreeStore } from '../data/store.js'

const three = useThreeStore()

</script>

<template>
  {{ three.scene }}
  {{ gamepad?.id }}
  <VueSpeedometer
      :value="0"
      :minValue="0"
      :maxValue="100"
      :needleTransitionDuration="0"
  />
  <VueSpeedometer
    :value="gamepads[0].axes[0]"
    :minValue="-1"
    :maxValue="1"
    :needleTransitionDuration="0"
  />

  <div ></div>
</template>

<style scoped>

</style>
