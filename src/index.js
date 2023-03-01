import './style.css'
import Game from './js/game/Game'

window.addEventListener('load', () => {
    const game = new Game()
})


/*
import './img/arid_ft.jpg'
import './img/arid_bk.jpg'
import './img/arid_lf.jpg'
import './img/arid_rt.jpg'
import './img/arid_up.jpg'
import './img/arid_dn.jpg'

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

console.log("hello world")

const stats = Stats()
document.body.appendChild(stats.dom)

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
camera.position.z = 5;

const world = new CANNON.World()
const cannonDebugger = new CannonDebugger(scene, world, {

})

world.gravity.set(0, -9.82, 0)


const gui = new GUI()
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera, 'fov', 0, 180)
cameraFolder.add(camera, 'aspect', 0, window.innerWidth / window.innerHeight)
cameraFolder.add(camera.position, 'z', 0, 10)
cameraFolder.open()

const vehicleFolder = gui.addFolder('Vehicle')
vehicleFolder.add(camera, 'fov', 0, 180)
vehicleFolder.open()

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let controls = new OrbitControls(camera, renderer.domElement)

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'src/img/arid_ft.jpg',
    'src/img/arid_bk.jpg',
    'src/img/arid_up.jpg',
    'src/img/arid_dn.jpg',
    'src/img/arid_rt.jpg',
    'src/img/arid_lf.jpg',
]);
scene.background = texture;

const light1 = new THREE.SpotLight()
light1.position.set(2.5, 5, 5)
light1.angle = Math.PI / 4
light1.penumbra = 0.5
light1.castShadow = true
light1.shadow.mapSize.width = 1024
light1.shadow.mapSize.height = 1024
light1.shadow.camera.near = 0.5
light1.shadow.camera.far = 20
scene.add(light1)

// create a ground body with a static plane
const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    // infinte geometric plane
    shape: new CANNON.Plane(),
});
// rotate ground body by 90 degrees
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
// groundBody.quaternion.setFromEuler(-Math.PI / 2, Math.PI / 24, 0);
world.addBody(groundBody);

const carBody = new CANNON.Body({
    mass: 5,
    position: new CANNON.Vec3(0, 6, 0),
    shape: new CANNON.Box(new CANNON.Vec3(6, 0.5, 2)),
});

const vehicle = new CANNON.RigidVehicle({
    chassisBody: carBody,
});

const mass = 5;
const axisWidth = 5;
const wheelShape = new CANNON.Sphere(1);
const wheelMaterial = new CANNON.Material('wheel');
const down = new CANNON.Vec3(0, -1, 0);

const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody1.addShape(wheelShape);
wheelBody1.angularDamping = 0.4;
vehicle.addWheel({
    body: wheelBody1,
    position: new CANNON.Vec3(-4, -0.5, axisWidth / 2),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
});

const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody2.addShape(wheelShape);
wheelBody2.angularDamping = 0.4;
vehicle.addWheel({
    body: wheelBody2,
    position: new CANNON.Vec3(-4, -0.5, -axisWidth / 2),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
});

const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody3.addShape(wheelShape);
wheelBody3.angularDamping = 0.4;
vehicle.addWheel({
    body: wheelBody3,
    position: new CANNON.Vec3(4, -0.5, axisWidth / 2),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
});

const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody4.addShape(wheelShape);
wheelBody4.angularDamping = 0.4;
vehicle.addWheel({
    body: wheelBody4,
    position: new CANNON.Vec3(4, -0.5, -axisWidth / 2),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
});

vehicle.addToWorld(world);

const boxGeometry = new THREE.BoxGeometry(12, 1, 4);
const boxMaterial = new THREE.MeshNormalMaterial();
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(boxMesh);

const sphereGeometry1 = new THREE.SphereGeometry(1);
const sphereMaterial1 = new THREE.MeshNormalMaterial();
const sphereMesh1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
scene.add(sphereMesh1);

const sphereGeometry2 = new THREE.SphereGeometry(1);
const sphereMaterial2 = new THREE.MeshNormalMaterial();
const sphereMesh2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
scene.add(sphereMesh2);

const sphereGeometry3 = new THREE.SphereGeometry(1);
const sphereMaterial3 = new THREE.MeshNormalMaterial();
const sphereMesh3 = new THREE.Mesh(sphereGeometry3, sphereMaterial3);
scene.add(sphereMesh3);

const sphereGeometry4 = new THREE.SphereGeometry(1);
const sphereMaterial4 = new THREE.MeshNormalMaterial();
const sphereMesh4 = new THREE.Mesh(sphereGeometry4, sphereMaterial4);
scene.add(sphereMesh4);

document.addEventListener('keydown', (event) => {
    const maxSteerVal = Math.PI / 6;
    const maxForce = 100;

    switch (event.key) {
        case 'z':
        case 'ArrowUp':
            vehicle.setWheelForce(maxForce, 2);
            vehicle.setWheelForce(maxForce, 3);
            break;

        case 's':
        case 'ArrowDown':
            vehicle.setWheelForce(-maxForce, 0);
            vehicle.setWheelForce(-maxForce, 1);
            break;

        case 'q':
        case 'ArrowLeft':
            vehicle.setSteeringValue(maxSteerVal, 0);
            vehicle.setSteeringValue(maxSteerVal, 1);
            break;

        case 'd':
        case 'ArrowRight':
            vehicle.setSteeringValue(-maxSteerVal, 0);
            vehicle.setSteeringValue(-maxSteerVal, 1);
            break;
    }
});

// reset car force to zero when key is released
document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'z':
        case 'ArrowUp':
            vehicle.setWheelForce(0, 2);
            vehicle.setWheelForce(0, 3);
            break;

        case 's':
        case 'ArrowDown':
            vehicle.setWheelForce(0, 0);
            vehicle.setWheelForce(0, 1);
            break;

        case 'q':
        case 'ArrowLeft':
            vehicle.setSteeringValue(0, 0);
            vehicle.setSteeringValue(0, 1);
            break;

        case 'd':
        case 'ArrowRight':
            vehicle.setSteeringValue(0, 0);
            vehicle.setSteeringValue(0, 1);
            break;
    }

});

function animate() {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    controls.target.copy(carBody.position)
    controls.position = carBody.position
    controls.update()

    boxMesh.position.copy(carBody.position);
    boxMesh.quaternion.copy(carBody.quaternion);
    sphereMesh1.position.copy(wheelBody1.position);
    sphereMesh1.quaternion.copy(wheelBody1.quaternion);
    sphereMesh2.position.copy(wheelBody2.position);
    sphereMesh2.quaternion.copy(wheelBody2.quaternion);
    sphereMesh3.position.copy(wheelBody3.position);
    sphereMesh3.quaternion.copy(wheelBody3.quaternion);
    sphereMesh4.position.copy(wheelBody4.position);
    sphereMesh4.quaternion.copy(wheelBody4.quaternion);

    stats.update()

    world.fixedStep(1.0/60.0) // Update cannon-es physics
    cannonDebugger.update() // Update the CannonDebugger meshes
    renderer.render( scene, camera );
}

animate();*/
