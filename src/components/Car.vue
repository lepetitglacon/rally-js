<script async setup >
import {useLoader, useRenderLoop, useTresContext} from '@tresjs/core'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'
import {useCannonContext} from "../composable/useCannonContext.js";
import {useCar} from "../composable/useCar.js";
import {computed, onMounted, toRaw} from "vue";
import {useGamepad} from "@vueuse/core";
import * as CANNON from "cannon-es";

const { gamepads, onConnected } = useGamepad()
onConnected((gamepadIndex) => {
  console.log(gamepads.value[gamepadIndex].id, ' connected')
})

const gamepad = computed(() => {
  if (gamepads.value) {
    return gamepads.value[0]
  }
})

const acceleration = computed(() => {
  if (gamepad.value) {
    return (-gamepad.value.axes[2] + 1) * 50
  } else {
	  return 0
  }
})
const angle = computed(() => {
  if (gamepad.value) {
    return gamepad.value.axes[0]
  } else {
    return zqsdPad.z
  }
})
const gear = computed(() => {
  if (gamepad.value) {
    if (gamepad.value.buttons[12].pressed) {return 1}
    if (gamepad.value.buttons[13].pressed) {return 2}
    if (gamepad.value.buttons[14].pressed) {return 3}
    if (gamepad.value.buttons[15].pressed) {return 4}
    if (gamepad.value.buttons[16].pressed) {return 5}
    if (gamepad.value.buttons[17].pressed) {return 6}
    return 0
  } else {
    return 0
  }
})

const { scene, camera, controls } = useTresContext()
const { onLoop } = useRenderLoop()
const { world } = useCannonContext()
const { car } = useCar()

for (const wheel of car.wheels) {
  scene.value.add(wheel.mesh)
}

onLoop(() => {
    car.update(acceleration.value, angle.value, gear.value)
})

const zqsdPad = {
	z: -1,
	q: -1,
	s: -1,
	d: -1,
}

onMounted(() => {
	window.addEventListener('keydown', (e) => {
		switch (e.key) {
			case 'z': { zqsdPad.z = 1; break }
			case 'q': { zqsdPad.q = 1; break }
			case 's': { zqsdPad.s = 1; break }
			case 'd': { zqsdPad.d = 1; break }
		}
	})
	window.addEventListener('keyup', (e) => {
		switch (e.key) {
			case 'z': { zqsdPad.z = -1; break }
			case 'q': { zqsdPad.q = -1; break }
			case 's': { zqsdPad.s = -1; break }
			case 'd': { zqsdPad.d = -1; break }
		}
	})
})
</script>


<template>
</template>

<style>
#gamepad {
  z-index: 1500;
}
</style>