import { Vec3 } from 'cannon-es';
import { GUI } from 'dat.gui';

export default class KeyboardEvents {

    constructor() {

        this.forward = false
        this.backward = false
        this.right = false
        this.left = false
        this.up = false
        this.down = false
        this.escape = false

        this.movementVector = new Vec3()
        // const gui = GUI()
        // let folder = gui.addFolder('Listener')
        // folder.add(this.movementVector, "x", -10, 10).listen()
        // folder.add(this.movementVector, "y", -10, 10).listen()
        // folder.add(this.movementVector, "z", -10, 10).listen()
        // folder.open()

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

                case 'Escape':
                    // case 'ArrowRight':
                    this.escape = true
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

                case 'Escape':
                    // case 'ArrowRight':
                    this.escape = false
                    break;
            }
        });
    }

    update() {
        this.movementVector.set(0,0,0)
        if ( this.forward ){
            this.movementVector.z = -1;
        }
        if ( this.backward ){
            this.movementVector.z = +1;
        }
        if ( this.left ){
            this.movementVector.x = -1;
        }
        if ( this.right ){
            this.movementVector.x = 1;
        }
        if ( this.up ){
            this.movementVector.y = 1;
        }
    }
}



