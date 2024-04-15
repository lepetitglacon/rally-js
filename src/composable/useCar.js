import {useCannonContext} from "./useCannonContext.js";
import * as CANNON from "cannon-es";
import { computed } from 'vue'
import { useGamepad } from '@vueuse/core'
import * as THREE from "three";
import Wheel from "./Wheel.js";

const { world } = useCannonContext()

const car = {
    body: {},
    wheels: [],
    constraints: []
}

const shape = new CANNON.Box(new CANNON.Vec3(2, 1.5, 4))
const carBody = new CANNON.Body({
    mass: 950, // Mass of the car
    position: new CANNON.Vec3(0, 2, 0), // Initial position
    shape: shape, // Box shape for simplicity
});
car.body = carBody
world.addBody(carBody)

const leftFrontAxis = new CANNON.Vec3(1, 0, 0)
const rightFrontAxis = new CANNON.Vec3(1, 0, 0)
const leftBackAxis = new CANNON.Vec3(1, 0, 0)
const rightBackAxis = new CANNON.Vec3(1, 0, 0)

const wheelHeight = 80
const wheelRadius = 0.8
const wheelGeometry = new THREE.Vector3(wheelRadius, wheelRadius, 0.4)

const wheelConfig = [
    {
        geometry: wheelGeometry,
        position: new THREE.Vector3(-shape.halfExtents.x, wheelHeight, -shape.halfExtents.z),
        axis: leftFrontAxis,
        axisPivot: new CANNON.Vec3(-shape.halfExtents.x, -1.5, -shape.halfExtents.z),
        enableMotor: false,
        radius: wheelRadius,
    },
    {
        geometry: wheelGeometry,
        position: new THREE.Vector3(shape.halfExtents.x, wheelHeight, -shape.halfExtents.z),
        axis: rightFrontAxis,
        axisPivot: new CANNON.Vec3(shape.halfExtents.x, -1.5, -shape.halfExtents.z),
        enableMotor: false,
        radius: wheelRadius,
    },
    {
        geometry: wheelGeometry,
        position: new THREE.Vector3(-shape.halfExtents.x, wheelHeight, shape.halfExtents.z),
        axis: leftBackAxis,
        axisPivot: new CANNON.Vec3(-shape.halfExtents.x, -1.5, shape.halfExtents.z),
        enableMotor: true,
        radius: wheelRadius,
    },
    {
        geometry: wheelGeometry,
        position: new THREE.Vector3(shape.halfExtents.x, wheelHeight, shape.halfExtents.z),
        axis: rightBackAxis,
        axisPivot: new CANNON.Vec3(shape.halfExtents.x, -1.5, shape.halfExtents.z),
        enableMotor: true,
        radius: wheelRadius,
    },
]

for (const wheelConfigElement of wheelConfig) {
    car.wheels.push(new Wheel({config:wheelConfigElement, car: carBody}))
}

export function useCar() {
    return {car: car}
}