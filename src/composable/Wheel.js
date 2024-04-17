import * as CANNON from "cannon-es";
import * as THREE from "three";

export default class Wheel {

    constructor({config, car}) {

        this.car = car
        this.radius = config.radius

        this.isDrivingWheel = config.enableMotor

        this.wheelMaterial = new CANNON.Material('wheelMaterial')
        this.wheelMaterial.friction = 0.8
        this.wheelMaterial.restitution = 0.1

        const wheelHeight = 80
        const wheelRadius = 0.8

        this.geometry = new THREE.CylinderGeometry(
            wheelRadius,
            wheelRadius,
            wheelRadius / 2,
        )
        // this.geometry.rotateZ(Math.PI / 2)

        this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial())
        this.mesh.position.copy(car.position)
        this.mesh.position.add(config.position)
        this.mesh.castShadow = true

        this.shape = new CANNON.Cylinder(wheelRadius, wheelRadius, wheelRadius, 32)

        this.body = new CANNON.Body({mass: 25, material: this.wheelMaterial})
        this.body.addShape(this.shape)
        // this.body.type = CANNON.Body.STATIC
        this.body.position.copy(this.mesh.position)
        // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI/2)
        // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI/2)

        const axleLocationInChassis = new CANNON.Vec3(0, 1, 0); // Position of axle relative to chassis (Y-axis for upward direction)
        const wheelCenter = new CANNON.Vec3(0, wheelRadius / 2, 0); // Center of the wheel (halfway up the cylinder)
        // Create a Cannon.js hinge constraint
        this.constraint = new CANNON.HingeConstraint(
            car,
            this.body,
            {
                pivotA: config.axisPivot, // Attachment point on car chassis
                pivotB: wheelCenter,        // Attachment point on wheel (center of bottom face)
                axisA: new CANNON.Vec3(0, 1, 0),  // Hinge axis (car's upward Y-axis for steering)
                // Optional limits for steering angle (adjust values as needed)
                lowerAngle: -Math.PI / 4,  // Minimum steering angle (e.g., -45 degrees)
                upperAngle: Math.PI / 4,   // Maximum steering angle (e.g., 45 degrees)
            }
        );

        // this.constraint = new CANNON.HingeConstraint(car, this.body, {
        //     pivotA: config.axisPivot.clone(), // centre de la roue
        //     axisA: config.axis.clone(), // axe de rotation
        // })

        this.attachmentA = new THREE.Mesh(
            new THREE.SphereGeometry(.1),
            new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Red for visualization
        );
        this.attachmentB = new THREE.Mesh(
            new THREE.SphereGeometry(.1),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // Green for visualization
        );
        this.attachmentA.position.copy(this.constraint.pivotA).add(car.position);
        this.attachmentB.position.copy(this.constraint.pivotB).add(car.position);
        this.hingeLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints( [this.attachmentA.position, this.attachmentB.position] ),
            new THREE.LineBasicMaterial({ color: 0xcccccc })
        );
        // this.hingeLine.geometry.vertices.push();

        // Define constraint parameters
        const springConstant = 1; // Stiffness of the spring
        const dampingCoefficient = 0; // Damping coefficient
        const restLength = 1; // Rest length of the spring

        // Create soft constraint (distance constraint)
        // this.suspension = new CANNON.Spring(car, this.body, {
        //     restLength: 1,
        //     stiffness: 50,
        //     damping: 1,
        // })

        // if (this.isDrivingWheel) {
        //     this.constraint.enableMotor()
        // } else {
        //
        // }
    }

    update(forwardVelocity, rightVelocity) {
        this.mesh.position.copy(this.body.position)
        this.mesh.quaternion.copy(this.body.quaternion)

        this.attachmentA.position.copy(this.constraint.pivotA).add(this.car.position);
        this.attachmentB.position.copy(this.constraint.pivotB).add(this.car.position);
        this.hingeLine.geometry.setFromPoints([this.attachmentA.position, this.attachmentB.position])

        if (this.isDrivingWheel) {
            this.constraint.setMotorSpeed(forwardVelocity)
        } else {
            this.constraint.axisA.z = rightVelocity
        }
    }
}