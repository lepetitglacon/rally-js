export default class InputManager {
    public keys: {
        throttle: boolean;
        brake: boolean;
        right: boolean
        left: boolean;
        handbrake: boolean;
    };
    private keyMap: {
        throttle: 'z',
        brake: 's',
        left: 'q',
        right: 'd',
        handbrake: ' ',
    };

    constructor() {
        this.keys = {
            throttle: false,
            brake: false,
            left: false,
            right: false,
            handbrake: false
        };

        // TODO keymap
        this.keyMap = {
            throttle: 'z',
            brake: 's',
            left: 'q',
            right: 'd',
            handbrake: ' ',
        }

        this.setupKeyboard();
        this.setupGamepad();
    }

    setupKeyboard() {
        window.addEventListener("keydown", (event) => {
            console.log(event)
            switch (event.key) {
                case this.keyMap.throttle:
                    this.keys.throttle = true;
                    break;
                case this.keyMap.brake:
                    this.keys.brake = true;
                    break;
                case this.keyMap.left:
                    this.keys.left = true;
                    break;
                case this.keyMap.right:
                    this.keys.right = true;
                    break;
                case this.keyMap.handbrake: // Handbrake
                    this.keys.handbrake = true;
                    break;
            }
        });
        window.addEventListener("keyup", (event) => {
            switch (event.key) {
                case this.keyMap.throttle:
                    this.keys.throttle = false;
                    break;
                case this.keyMap.brake:
                    this.keys.brake = false;
                    break;
                case this.keyMap.left:
                    this.keys.left = false;
                    break;
                case this.keyMap.right:
                    this.keys.right = false;
                    break;
                case this.keyMap.handbrake: // Handbrake
                    this.keys.handbrake = false;
                    break;
            }
        });
    }

    setupGamepad() {
        window.addEventListener("gamepadconnected", () => {
            console.log("Gamepad connected!");
        });
    }

    update() {

    }
}