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

// Car parameters (adjust as needed)
const carLength = 4; // Units
const carWidth = 2; // Units
const carHeight = 1; // Units
const wheelRadius = 0.5; // Units
const wheelWidth = 0.3; // Units

// Material for car and wheels (adjust friction properties if needed)
const material = new CANNON.Material('carMaterial');
const materialBody = new CANNON.Material('wheelMaterial');

// Create the car chassis body (box shape)
const chassisShape = new CANNON.Box(new CANNON.Vec3(carLength / 2, carWidth / 2, carHeight / 2));
const chassisBody = new CANNON.Body({ mass: 1000, material: material });
chassisBody.addShape(chassisShape);
world.addBody(chassisBody);

// Create the wheel bodies (cylinder shapes)
const wheelBodies = [];
for (let i = 0; i < 4; i++) { // Create 4 wheels
    const wheelShape = new CANNON.Cylinder(wheelRadius, wheelRadius, wheelWidth / 2);
    const wheelBody = new CANNON.Body({ mass: 20, material: materialBody });
    wheelBody.addShape(wheelShape);
    wheelBodies.push(wheelBody);
    world.addBody(wheelBody);
}

// Define positions for wheel attachment points (relative to chassis)
const wheelPositions = [
    { x: -carLength / 4, y: carHeight / 2 - wheelRadius, z: carWidth / 4 }, // Front left
    { x: carLength / 4, y: carHeight / 2 - wheelRadius, z: carWidth / 4 }, // Front right
    { x: -carLength / 4, y: carHeight / 2 - wheelRadius, z: -carWidth / 4 }, // Rear left
    { x: carLength / 4, y: carHeight / 2 - wheelRadius, z: -carWidth / 4 }, // Rear right
];

// Create hinge constraints for each wheel (assuming Y-axis is up)
const hingeConstraints = [];
for (let i = 0; i < 4; i++) {
    const hingeConstraint = new CANNON.HingeConstraint(
        chassisBody,
        wheelBodies[i],
        {
            pivotA: new CANNON.Vec3(wheelPositions[i].x, wheelPositions[i].y, wheelPositions[i].z),
            pivotB: new CANNON.Vec3(0, wheelRadius, 0), // Center of wheel cylinder bottom
            axisA: new CANNON.Vec3(0, 1, 0), // Y-axis for steering (optional limits can be added)
        }
    );
    hingeConstraints.push(hingeConstraint);
    world.addConstraint(hingeConstraint);
}

// const rightFrontAxis = new CANNON.Vec3(0, 1, 0)
// const leftBackAxis = new CANNON.Vec3(0, 1, 0)
// const rightBackAxis = new CANNON.Vec3(0, 1, 0)
//
// const wheelHeight = 15
// const wheelConfig = [
//     {
//         // position: new THREE.Vector3(-shape.halfExtents.x, wheelHeight, -shape.halfExtents.z),
//         position: new THREE.Vector3(-shape.halfExtents.x, wheelHeight, -shape.halfExtents.z),
//         axisPivot: new CANNON.Vec3(-shape.halfExtents.x, 1, -shape.halfExtents.z),
//         enableMotor: false,
//     },
//     {
//         position: new THREE.Vector3(shape.halfExtents.x, wheelHeight, -shape.halfExtents.z),
//         axisPivot: new CANNON.Vec3(shape.halfExtents.x, 1, -shape.halfExtents.z),
//         enableMotor: false,
//     },
//     {
//         position: new THREE.Vector3(-shape.halfExtents.x, wheelHeight, shape.halfExtents.z),
//         axisPivot: new CANNON.Vec3(-shape.halfExtents.x, 1, shape.halfExtents.z),
//         enableMotor: true,
//     },
//     {
//         position: new THREE.Vector3(shape.halfExtents.x, wheelHeight, shape.halfExtents.z),
//         axisPivot: new CANNON.Vec3(shape.halfExtents.x, 1, shape.halfExtents.z),
//         enableMotor: true,
//     },
// ]
//
// for (const wheelConfigElement of wheelConfig) {
//     car.wheels.push(new Wheel({config:wheelConfigElement, car: carBody}))
// }

export function useCar() {
    return {car: car}
}