import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import KeyboardEvents from "../engine/events/keyboardEvents";

export default class Game {

    constructor() {
        this.init()
    }

    init() {
        this.initThree()
        this.initCannon()
        this.initControls()
        this.bindControls()

        this.createWorld()
        this.createCar()


        console.log('init')
        this.animate()
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // this.three_.camera.position.x = this.car.position.x - 5
        // this.three_.camera.position.z = this.car.position.z + 1
        // this.three_.camera.position.y = this.car.position.y + 5

        this.controls_.update(1.0/60.0)

        console.log(this.controls_.movementVector)
        this.car.velocity.set(
            this.controls_.movementVector.x,
            this.controls_.movementVector.y,
            this.controls_.movementVector.z
        )

        const speed = 50
        this.car.position.x += this.car.velocity.x * speed
        if (this.car.velocity.y > 0) {
            this.car.position.y += this.car.velocity.y
        }
        this.car.position.z += this.car.velocity.z * speed

        this.cannon_.world.fixedStep(1.0/60.0) // Update cannon-es physics
        this.cannon_.debugger.update() // Update the CannonDebugger meshes
        this.three_.renderer.render( this.three_.scene, this.three_.camera );
    }

    initThree() {
        this.three_ = {}
        this.three_.scene = new THREE.Scene()
        this.three_.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
        this.three_.renderer = new THREE.WebGLRenderer()

        this.three_.camera.position.z = 5;
        this.three_.renderer.setSize(window.innerWidth, window.innerHeight)

        var light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        light.position.set( 0, 20, 0 );
        this.three_.scene.add( light );

        const loader = new THREE.CubeTextureLoader();
        this.three_.scene.background = loader.load([
            'src/img/arid_ft.jpg',
            'src/img/arid_bk.jpg',
            'src/img/arid_up.jpg',
            'src/img/arid_dn.jpg',
            'src/img/arid_rt.jpg',
            'src/img/arid_lf.jpg',
        ]);

        document.body.appendChild( this.three_.renderer.domElement );
    }

    initCannon() {
        this.cannon_ = {}
        this.cannon_.world = new CANNON.World()
        this.cannon_.debugger = new CannonDebugger(this.three_.scene, this.cannon_.world)

        this.cannon_.world.gravity.set( 0, -20, 0 );
        this.cannon_.world.broadphase = new CANNON.NaiveBroadphase();
        this.cannon_.world.solver.iterations = 10;
        this.cannon_.world.broadphase.useBoundingBoxes = true;
        this.cannon_.world.gravity.set(0, -9.82, 0)
    }

    initControls() {
        this.three_.controls = new OrbitControls(this.three_.camera, this.three_.renderer.domElement)
    }

    createWorld() {
        // create a ground body with a static plane
        const groundBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.cannon_.world.addBody(groundBody)
    }

    createCar() {
        const cubeshape = new CANNON.Box(new CANNON.Vec3( 1, 1, 1 ));
        const carBody = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(0, 1, 0),
            material: new CANNON.Material( 'slipperyMaterial' )
        });
        carBody.addShape( cubeshape );
        this.car = carBody
        this.cannon_.world.addBody(carBody)
    }

    bindControls() {
        this.controls_ = new KeyboardEvents()
    }
}