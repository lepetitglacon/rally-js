import { Vec3 } from 'cannon-es';

export default class KeyboardEvents {

    constructor() {
        this.velocityFactor = 0.2;
        this.jumpVelocity = 20;

        this.forward = false
        this.backward = false
        this.right = false
        this.left = false
        this.up = false
        this.down = false
        this.movementVector = new Vec3()

        document.addEventListener('keydown', (event) => {

            switch (event.key) {
                case 'z':
                case 'ArrowUp':
                    this.forward = true
                    break;

                case 's':
                case 'ArrowDown':
                    this.backward = true
                    break;

                case 'q':
                case 'ArrowLeft':
                    this.left = true
                    break;

                case 'd':
                case 'ArrowRight':
                    this.right = true
                    break;

                case ' ':
                // case 'ArrowRight':
                    this.up = true
                    break;
            }
        });

        // reset car force to zero when key is released
        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'z':
                case 'ArrowUp':
                    this.forward = false
                    break;

                case 's':
                case 'ArrowDown':
                    this.backward = false
                    break;

                case 'q':
                case 'ArrowLeft':
                    this.left = false
                    break;

                case 'd':
                case 'ArrowRight':
                    this.right = false
                    break;
                case ' ':
                    // case 'ArrowRight':
                    this.up = false
                    break;
            }
        });
    }

    update(delta) {
        this.movementVector.set(0,0,0)

        if ( this.forward ){
            this.movementVector.z = -this.velocityFactor * delta;
        }
        if ( this.backward ){
            this.movementVector.z = this.velocityFactor * delta;
        }
        if ( this.left ){
            this.movementVector.x = -this.velocityFactor * delta;
        }
        if ( this.right ){
            this.movementVector.x = this.velocityFactor * delta;
        }
        if ( this.up ){
            this.movementVector.y = this.velocityFactor * delta;
        }
    }
}



