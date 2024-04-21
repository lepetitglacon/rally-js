<script setup>

import * as CANNON from "cannon-es";
import { useCannonContext } from "../../composable/useCannonContext.js";
import CannonDebugger from "../../lib/cannon-es-debugger.js";
import {useRenderLoop, useTresContext} from "@tresjs/core";

const { world } = useCannonContext()
const { onLoop, resume } = useRenderLoop()
const { scene, camera, renderer } = useTresContext()

const cannonDebugger = new CannonDebugger(scene.value, world, {})

const groundMaterial = new CANNON.Material('groundMaterial')
groundMaterial.friction = .8
groundMaterial.restitution = 0.1

const mapSize = 200

const groundShape = new CANNON.Box(new CANNON.Vec3(mapSize, 1, mapSize))
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
groundBody.addShape(groundShape)
groundBody.position.set(0, -1, 0)
world.addBody(groundBody)

if (!world.springs) {
  world.springs = []
}

console.log(world)

onLoop(({ delta, elapsed, clock }) => {
  // I will run at every frame ~60FPS (depending of your monitor)
  world.fixedStep(1/60)
  cannonDebugger.update()
})
</script>


<template>

</template>