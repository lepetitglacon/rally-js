import * as CANNON from "cannon-es";
import * as THREE from "three";
import {useCannonContext} from "./useCannonContext.js";

const { world } = useCannonContext()

export default class Wheel {

    constructor({config, car}) {

        this.car = car
        this.isDrivingWheel = config.enableMotor

        const radiusTop = .8
        const radiusBottom = .8
        const height = .4
        const numSegments = 32

        this.shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegments)
        this.body = new CANNON.Body({ mass: 20, shape: this.shape })
        this.body.position.copy(car.body.position.clone().vadd(config.wheelPosition))

        this.tireMaterial = new CANNON.Material("tireMaterial");
        this.tireMaterial.friction = 1.5; // High friction for good grip
        this.tireMaterial.restitution = 0.2; // Some bouncing after impact
        this.body.material = this.tireMaterial
        world.addBody(this.body)

        this.rotuleShape = new CANNON.Box(new CANNON.Vec3(.1, .4, .1))
        this.rotuleBody = new CANNON.Body({ mass: 25, shape: this.rotuleShape })
        this.rotuleBody.position.copy(car.body.position.clone().vsub(config.wheelPosition))
        // this.rotuleBody.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2)
        world.addBody(this.rotuleBody)

        this.rotuleConstraint = new CANNON.HingeConstraint(
            car.body,
            this.rotuleBody,
            {
                pivotA: config.wheelPosition,
                axisA: new CANNON.Vec3(0, 0, 1),
                // axisB: new CANNON.Vec3(0, 1, 0),
            }
        )
        world.addConstraint(this.rotuleConstraint)

        // this.spring = new CANNON.Spring(
        //     this.rotuleBody,
        //     this.body,
        //     {
        //         // localAnchorA: ,
        //         restLength: 0,
        //         stiffness: 10,
        //         damping: 100,
        //     })
        // world.addEventListener('postStep', (event) => {
        //     this.spring.applyForce()
        // })
        // world.springs.push(this.spring)


        // this.constraint = new CANNON.HingeConstraint(
        //     this.rotuleBody,
        //     this.body,
        //     {
        //         pivotA: new CANNON.Vec3(0, -1,0), // Attachment point on car chassis
        //         pivotB: new CANNON.Vec3(),        // Attachment point on wheel (center of bottom face)
        //         axisA: new CANNON.Vec3(1, 0, 0),  // Hinge axis (car's upward Y-axis for steering)
        //         axisB: new CANNON.Vec3(0, 1, 0),  // Hinge axis (car's upward Y-axis for steering)
        //     }
        // );
        // world.addConstraint(this.constraint)
        // if (this.isDrivingWheel) {
        //     this.constraint.enableMotor()
        // }

        this.geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height)
        this.material = new THREE.MeshBasicMaterial()
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.copy(this.body.position)
        this.mesh.position.add(car.body.position)
        this.mesh.castShadow = true
        if (this.isDrivingWheel) {
            this.material.color = new THREE.Color(0xFF00FF)
        }

    }

    update(forwardVelocity, rightVelocity) {
        this.mesh.position.copy(this.body.position)
        this.mesh.quaternion.copy(this.body.quaternion)

        if (this.isDrivingWheel && this.rotuleConstraint) {
            // this.rotuleConstraint.setMotorSpeed(forwardVelocity)
            console.log(this.rotuleConstraint.axisA.y)
            this.rotuleConstraint.axisA.y = -rightVelocity
        }
    }
}