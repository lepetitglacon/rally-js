<script setup>
import {useCar} from "../composable/useCar.js";
import {computed, onMounted, ref} from "vue";
import {useGameEngine} from "../composable/useGameEngine.js";
const {car} = useCar()
const {gameEngine} = useGameEngine()

const kmHr = ref(0)
const position = ref(null)
const closestPoint = ref(null)

const countdown = ref(null)
const run = ref(null)

onMounted(() => {
	car.addEventListener('speed-change', (e) => {
		kmHr.value = e.detail
	})
	car.addEventListener('position-change', (e) => {
		position.value = e.detail
	})
	car.addEventListener('closest_point-change', (e) => {
		closestPoint.value = e.detail
	})
	gameEngine.addEventListener('vue/gameEngine/countdown-start', (e) => {
		countdown.value = e.detail
	})
	gameEngine.addEventListener('vue/gameEngine/countdown-change', (e) => {
		countdown.value = e.detail
	})
})

</script>

<template>
	<div class="game-ui">
		<p>{{ countdown }}</p>
		<p>run : {{ run }}</p>

	</div>
	<div class="car-ui">
		<p>position : <span>{{ position }}</span></p>
		<p>distance to line : <span>{{ closestPoint }}</span></p>
		<p>speed : <span>{{ Math.abs(kmHr) }}</span> km/h</p>
		<p>distance from road : <span></span> m</p>
		<p>distance to end : <span></span> m</p>
	</div>
</template>

<style scoped>
.game-ui {
	z-index: 150;
	position: absolute;
	top: 0;
	left: 0;

	color: white;
	border: #1a1a1a 5px;
	text-shadow: 2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000;
}
.car-ui {
	z-index: 150;
	position: absolute;
	bottom: 0;
	left: 0;
	text-align: start;

	color: white;
	border: #1a1a1a 5px;
	text-shadow: 2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000;
}
</style>