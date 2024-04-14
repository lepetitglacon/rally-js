import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import * as CANNON from 'cannon-es'
import CannonDebugRenderer from 'cannon-es-debugger'
import GLTFLoader from 'three/examples/jsm/loaders/GLTFLoader';

import '../../assets/img/arid_ft.jpg'
import '../../assets/img/arid_bk.jpg'
import '../../assets/img/arid_lf.jpg'
import '../../assets/img/arid_rt.jpg'
import '../../assets/img/arid_up.jpg'
import '../../assets/img/arid_dn.jpg'

// https://sbcode.net/threejs/physics-car/
// https://www.fiches-auto.fr/fiche-technique-renault/specs-106-technique-renault-clio-3.php
export default function Game() {
    const gui = new GUI()

    const carsConfiguration = {
        0: {
            name: "Clio 3",
            shape: {
                x: 1.7,
                y: 1.5,
                z: 4.0,
            },
            mass: 1150,
            gears: {
                '-1': {
                    acceleration: -.1,
                    maxAcceleration: 10,
                    engineBreak: .1
                },
                0: {
                    acceleration: 0,
                    maxAcceleration: 0,
                    engineBreak: 0
                },
                1: {
                    acceleration: .4,
                    maxAcceleration: 20,
                    engineBreak: .1
                },
                2: {
                    acceleration: .3,
                    maxAcceleration: 40,
                    engineBreak: .3
                },
                3: {
                    acceleration: .2,
                    maxAcceleration: 50,
                    engineBreak: .2
                },
                4: {
                    acceleration: .1,
                    maxAcceleration: 100,
                    engineBreak: .1
                },
            },
            wheel: {
                radius: .33,
                x: 0,
                y: 0,
                z: 0
            }
        }
    }

    const scene = new THREE.Scene()

    const light = new THREE.DirectionalLight()
    light.position.set(25, 50, 25)
    light.castShadow = true
    light.shadow.mapSize.width = 16384
    light.shadow.mapSize.height = 16384
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 100
    light.shadow.camera.top = 100
    light.shadow.camera.bottom = -100
    light.shadow.camera.left = -100
    light.shadow.camera.right = 100
    scene.add(light)

    const helper = new THREE.CameraHelper(light.shadow.camera)
    scene.add(helper)

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    )
    const chaseCam = new THREE.Object3D()
    chaseCam.position.set(0, 0, 0)
    const chaseCamPivot = new THREE.Object3D()
    chaseCamPivot.position.set(0, 2, 4)
    chaseCam.add(chaseCamPivot)
    scene.add(chaseCam)

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(renderer.domElement)

    const phongMaterial = new THREE.MeshPhongMaterial()

    const world = new CANNON.World()
    world.gravity.set(0, -9.82, 0)

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'src/assets/img/arid_ft.jpg',
        'src/assets/img/arid_bk.jpg',
        'src/assets/img/arid_up.jpg',
        'src/assets/img/arid_dn.jpg',
        'src/assets/img/arid_rt.jpg',
        'src/assets/img/arid_lf.jpg',
    ]);
    scene.background = texture;

    const groundMaterial = new CANNON.Material('groundMaterial')
    groundMaterial.friction = 0.7
    groundMaterial.restitution = 0.7



    const wheelMaterial = new CANNON.Material('wheelMaterial')
    wheelMaterial.friction = .7
    wheelMaterial.restitution = .7

//ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMesh = new THREE.Mesh(groundGeometry, phongMaterial)
    groundMesh.rotateX(-Math.PI / 2)
    groundMesh.receiveShadow = true
    scene.add(groundMesh)
    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromEuler(-Math.PI/2, 0, 0)
    //groundBody.position.set(0, -1, 0)
    world.addBody(groundBody)

//jumps
    for (let i = 0; i < 50; i++) {
        const jump = new THREE.Mesh(
            new THREE.CylinderGeometry(0, 1, 2, 5),
            phongMaterial
        )
        jump.position.x = Math.random() * 100 - 50
        jump.position.y = 0.5
        jump.position.z = Math.random() * 100 - 50
        scene.add(jump)

        const cylinderShape = new CANNON.Cylinder(0.01, 1, 2, 5)
        const cylinderBody = new CANNON.Body({ mass: 0 })
        cylinderBody.addShape(cylinderShape, new CANNON.Vec3())
        cylinderBody.position.x = jump.position.x
        cylinderBody.position.y = jump.position.y
        cylinderBody.position.z = jump.position.z
        world.addBody(cylinderBody)
    }

    function createCar(carProp) {
        let car = {}
        car.geometry = new THREE.BoxGeometry(carProp.shape.x, carProp.shape.y, carProp.shape.z)
        console.log(car.geometry)
        car.mesh = new THREE.Mesh(car.geometry, phongMaterial)
        car.mesh.position.y = 2
        car.mesh.castShadow = true
        scene.add(car.mesh)
        car.mesh.add(chaseCam)
        car.shape = new CANNON.Box(new CANNON.Vec3(
            car.geometry.parameters.width/2,
            car.geometry.parameters.height/2,
            car.geometry.parameters.depth/2,
            )
        )
        car.body = new CANNON.Body({ mass: carProp.mass })
        car.body.addShape(car.shape)
        car.body.position.copy(car.mesh.position)
        world.addBody(car.body)

        car.acceleration = 0
        car.breaking = 0
        car.turning = 0
        car.wheels = []

        car.update = function () {
            this.updatePosition()
            this.updateVelocity()
            this.updateWheels()
        }

        car.updatePosition = function () {
            car.mesh.position.copy(car.body.position)
            car.mesh.quaternion.copy(car.body.quaternion)
        }
        car.updateVelocity = function () {
            car.accelerate()
            car.break()
            car.turn()
            car.reset()

            car.updateWheels()
        }

        car.updateWheels = function () {
            for (let i = 0; i < car.wheels.length; i++) {
                car.wheels[i].updatePosition()
                if (car.wheels[i].driving) {
                    car.wheels[i].constraint.setMotorSpeed(car.acceleration)
                }
                if (car.wheels[i].turning) {
                    car.wheels[i].constraint.axisA.z = car.turning
                }
            }
        }
        car.accelerate = function () {
            if (keyMap['KeyW'] || keyMap['ArrowUp'] || axis.accelerator < 1.0) {
                if (car.accelezration < car.gears[car.gear].maxAcceleration) {
                    car.acceleration += car.gears[car.gear].acceleration
                }
            }

        }
        car.break = function () {
            if (keyMap['KeyS'] || keyMap['ArrowDown'] || axis.break < 1.0) {
                if (car.acceleration !== 0) {
                    car.breaking = .5
                    if (car.acceleration > 0) {
                        car.acceleration -= car.breaking
                    } else {
                        car.acceleration += car.breaking
                    }
                }
            } else {
                car.breaking = 0
            }
            // Engin break
            if (!keyMap['KeyW'] && !keyMap['ArrowUp']) {
                if (car.acceleration > 0) {
                    car.acceleration -= car.gears[car.gear].engineBreak
                }
            }
            if (car.acceleration > car.gears[car.gear].maxAcceleration) {
                car.acceleration = car.gears[car.gear].maxAcceleration
            }
        }
        car.turn = function () {
            let maxTurningAngle = 1
            if (keyMap['KeyA'] || keyMap['ArrowLeft']) {
                if (car.turning > -maxTurningAngle) car.turning -= 0.05
            }
            if (keyMap['KeyD'] || keyMap['ArrowRight']) {
                if (car.turning < maxTurningAngle) car.turning += 0.05
            }
            // reset wheels angle if no keys pressed
            if (!keyMap['KeyA'] && !keyMap['KeyD']) {
                if (car.turning > .001 || car.turning < -.001) {
                    if (car.turning > 0) {
                        car.turning -= 0.1
                    } else {
                        car.turning += 0.1
                    }
                }
            }
        }
        car.reset = function () {
            if (keyMap['Semicolon']) {
                car.body.position.y = 5
                car.body.quaternion.setFromEuler(0,0,0)
            }
        }

        car.gear = 0
        car.gears = carProp.gears

        return car
    }
    const car = createCar(carsConfiguration[0])

    const carFolder = gui.addFolder('Car')
    carFolder.add(car, 'gear').listen()
    carFolder.add(car, 'acceleration').listen()
    carFolder.add(car, 'breaking').listen()
    carFolder.add(car, 'turning').listen()
    carFolder.add(groundMaterial, 'friction', 0, 1, .1).listen()
    carFolder.add(groundMaterial, 'restitution', 0, 1, .1).listen()
    carFolder.open()
    const wheelsFolder = carFolder.addFolder('Wheels')

    /**
     * Create a wheel and everything related
     */
    function createWheel(
        name,
        radius,
        height,
        mass,
        position,
        pivot,
        force,
        driving,
        turning
        ) {
        let wheel = {}
        wheel.name = name
        wheel.geometry = new THREE.CylinderGeometry(radius, radius, height)
        wheel.geometry.rotateZ(Math.PI / 2)

        wheel.mesh = new THREE.Mesh(wheel.geometry, phongMaterial)
        wheel.mesh.position.set(position.x, position.y, position.z)
        wheel.mesh.castShadow = true
        scene.add(wheel.mesh)

        wheel.shape = new CANNON.Sphere(radius)

        wheel.body = new CANNON.Body({ mass: mass, material: wheelMaterial })
        wheel.body.addShape(wheel.shape)
        wheel.body.position.copy(wheel.mesh.position)

        wheel.axis = new CANNON.Vec3(1, 0, 0)
        wheel.constraint = new CANNON.HingeConstraint(car.body, wheel.body, {
            pivotA: pivot,
            axisA: wheel.axis,
            maxForce: force,
        })
        if (turning) {
            wheel.turning = true
        }
        if (driving) {
            wheel.driving = true
            wheel.constraint.enableMotor()
        }
        wheel.updatePosition = () => {
            wheel.mesh.position.copy(wheel.body.position)
            wheel.mesh.quaternion.copy(wheel.body.quaternion)
        }
        world.addConstraint(wheel.constraint)
        world.addBody(wheel.body)

        let folder = wheelsFolder.addFolder(wheel.name)
        folder.add(wheel.body.position, 'x').listen()
        folder.add(wheel.body.position, 'y').listen()
        folder.add(wheel.body.position, 'z').listen()

        return wheel
    }


    car.wheels.push(createWheel(
        'FrontLeft',
        .33,
        .2,
        30,
        new THREE.Vector3(-1, 3, -1.5),
        new THREE.Vector3(-1, -.5, -2),
        1199,
        false,
        true
    ))
    car.wheels.push(createWheel(
        'FrontRight',
        .33,
        .2,
        30,
        new THREE.Vector3(1, 3, -1.5),
        new THREE.Vector3(1, -.5, -2),
        1199,
        false,
        true
    ))
    car.wheels.push(createWheel(
        'BackLeft',
        .33,
        .2,
        30,
        new THREE.Vector3(-1, 3, 1.5),
        new THREE.Vector3(-1, -.5, 2),
        1199,
        true
    ))
    car.wheels.push(createWheel(
        'BackRight',
        .33,
        .2,
        30,
        new THREE.Vector3(1, 3, 1.5),
        new THREE.Vector3(1, -.5, 2),
        1199,
        true
    ))

    const keyMap = {}
    const onDocumentKey = (e) => {
        keyMap[e.code] = e.type === 'keydown'
    }

    /**
     * Remove context menu
     * @param e
     */
    document.oncontextmenu = function(e) {
        e.preventDefault()
    }

    document.addEventListener('mousedown', updateGear)
    function updateGear(e) {
        e.preventDefault()
        if (e.button === 0) {
            if (car.gear === '-1') {
                car.gear = 0
            } else {
                if (car.gear !== 4) {
                    car.gear++
                }
            }
        } else {
            if (car.gear === 0) {
                car.gear = '-1'
            } else {
                if (car.gear > 0) {
                    car.gear--
                }
            }
        }
    }
    document.addEventListener('keydown', onDocumentKey, false)
    document.addEventListener('keyup', onDocumentKey, false)

    let connectedGamePad = null
    window.addEventListener("gamepadconnected", function (e) {
        console.log(
            "Manette connectée à l'indice %d : %s. %d boutons, %d axes.",
            e.gamepad.index,
            e.gamepad.id,
            e.gamepad.buttons.length,
            e.gamepad.axes.length,
        );
        let gp = navigator.getGamepads()[e.gamepad.index];
        console.log(gp.axes)
        console.log(gp.buttons)
        connectedGamePad = e.gamepad.index
    });

    window.addEventListener('resize', onWindowResize, false)
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    }

    const stats = Stats()
    document.body.appendChild(stats.dom)

    const clock = new THREE.Clock()
    let delta

    const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

    const v = new THREE.Vector3()



    const axis = {
        wheel: 0,
        accelerator: 0,
        break: 0,
        clutch: 0,
    }

    function updateInput(gp) {
        axis.wheel = gp.axes[0]
        axis.accelerator = gp.axes[2]
        axis.break = gp.axes[6]
        axis.clutch = gp.axes[1]
    }

    function animate() {
        requestAnimationFrame(animate)
        helper.update()
        delta = Math.min(clock.getDelta(), 0.1)

        // update input
        if (connectedGamePad !== null) {
            let gp = navigator.getGamepads()[connectedGamePad];
            updateInput(gp)
        }

        car.update()

        world.step(delta)
        cannonDebugRenderer.update()

        camera.lookAt(car.mesh.position)
        chaseCamPivot.getWorldPosition(v)
        if (v.y < 1) {v.y = 1}
        camera.position.lerpVectors(camera.position, v, 0.05)

        render()
        stats.update()
    }
    animate()
    function render() {
        renderer.render(scene, camera)
    }
}
