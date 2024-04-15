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

        this.geometry = new THREE.CylinderGeometry(
            config.geometry.x,
            config.geometry.y,
            config.geometry.z,
        )
        this.geometry.rotateZ(Math.PI / 2)

        this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial())
        this.mesh.position.copy(car.position)
        this.mesh.position.add(config.position)
        this.mesh.castShadow = true

        this.shape = new CANNON.Sphere(config.radius)

        this.body = new CANNON.Body({mass: 25, material: this.wheelMaterial})
        this.body.addShape(this.shape)
        this.body.position.copy(this.mesh.position)

        this.constraint = new CANNON.HingeConstraint(car, this.body, {
            pivotA: config.axisPivot.clone(),
            axisA: config.axis.clone(),
            maxForce: 1000,
        })

        // Define constraint parameters
        const springConstant = 1; // Stiffness of the spring
        const dampingCoefficient = 0; // Damping coefficient
        const restLength = 1; // Rest length of the spring

        // Create soft constraint (distance constraint)
        this.suspension = new CANNON.Spring(car, this.body, {
            restLength: 1,
            stiffness: 50,
            damping: 1,
        })

        if (this.isDrivingWheel) {
            this.constraint.enableMotor()
        } else {

        }
    }

    update(forwardVelocity, rightVelocity) {
        this.mesh.position.copy(this.body.position)
        this.mesh.quaternion.copy(this.body.quaternion)

        if (this.isDrivingWheel) {
            this.constraint.setMotorSpeed(forwardVelocity)
        } else {
            this.constraint.axisA.z = rightVelocity
        }


        // this.body.angularVelocity.set(0, this.calculateWheelRotationSpeed(rightVelocity), 0);
    }

    calculateWheelRotationSpeed(steeringAngle) {
        // Calculate the distance between the wheels (track width) based on the steering angle
        const trackWidth = 2 * Math.sin(Math.abs(steeringAngle)) * this.radius;
        // Calculate the circumference of the turning circle for each wheel
        const turningCircleCircumference = Math.PI * trackWidth;
        // Calculate the linear velocity of the car based on its speed
        const linearVelocity = this.car.velocity.length();
        // Calculate the rotation speed of each wheel based on its position in the turning circle
        const wheelRotationSpeed = linearVelocity / turningCircleCircumference;
        return wheelRotationSpeed;
    }
}