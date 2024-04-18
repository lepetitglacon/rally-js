<script async setup >
import {useLoader, useRenderLoop, useTresContext} from '@tresjs/core'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'
import {useCannonContext} from "../composable/useCannonContext.js";
import {useCar} from "../composable/useCar.js";
import {computed, onMounted} from "vue";
import {useGamepad} from "@vueuse/core";
import * as CANNON from "cannon-es";

const { gamepads } = useGamepad()
const gamepad = computed(() => {
  if (gamepads.value) {
    return gamepads.value[0]
  } else {
	  return zqsdPad
  }
})
const acceleration = computed(() => {
  if (gamepad.value) {
    return (-gamepad.value.axes[2] + 1) * 50
  } else {
	return (-zqsdPad.z + 1) * 50
  }
})
const angle = computed(() => {
  if (gamepad.value) {
    return gamepad.value.axes[0]
  } else {
    return zqsdPad.q
  }
})

const { scene } = useTresContext()
const { onLoop } = useRenderLoop()
const { world } = useCannonContext()
const { car } = useCar()
console.log(car)

for (const wheel of car.wheels) {
  scene.value.add(wheel.mesh)
  scene.value.add(wheel.attachmentA)
  scene.value.add(wheel.attachmentB)
  scene.value.add(wheel.hingeLine)
  world.addBody(wheel.body)
  world.addConstraint(wheel.constraint)

  world.addEventListener('postStep', (event) => {
    // wheel.suspension.applyForce()
  })

}

onLoop(() => {
  for (const wheel of car.wheels) {
    if (gamepad.value) {
      // wheel.constraint.setMotorSpeed()
      wheel.update(acceleration.value, angle.value)
    }
  }
})

const zqsdPad = {
	z: -1,
	q: -1,
	s: -1,
	d: -1,
}

onMounted(() => {
	window.addEventListener('keydown', (e) => {
		console.log(e)
		switch (e.key) {
			case 'z': { zqsdPad.z = 1; break }
			case 'q': { zqsdPad.q = 1; break }
			case 's': { zqsdPad.s = 1; break }
			case 'd': { zqsdPad.d = 1; break }
		}
	})
	window.addEventListener('keyup', (e) => {
		console.log(e)
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