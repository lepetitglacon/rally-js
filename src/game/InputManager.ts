export default class InputManager {
    private keys: {
        throttle: boolean;
        brake: boolean;
        left: boolean;
        handbrake: boolean;
        right: boolean
    };
    private keyMap: {};

    constructor() {
        this.keys = {
            throttle: false,
            brake: false,
            left: false,
            right: false,
            handbrake: false
        };

        // TODO keymap
        this.keyMap = {}

        this.setupKeyboard();
        this.setupGamepad();
    }

    setupKeyboard() {
        window.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "ArrowUp": // Throttle
                case "KeyW":
                    this.keys.throttle = true;
                    break;
                case "ArrowDown": // Brake
                case "KeyS":
                    this.keys.brake = true;
                    break;
                case "ArrowLeft": // Steering Left
                case "KeyA":
                    this.keys.left = true;
                    break;
                case "ArrowRight": // Steering Right
                case "KeyD":
                    this.keys.right = true;
                    break;
                case "Space": // Handbrake
                    this.keys.handbrake = true;
                    break;
            }
        });

        window.addEventListener("keyup", (event) => {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    this.keys.throttle = false;
                    break;
                case "ArrowDown":
                case "KeyS":
                    this.keys.brake = false;
                    break;
                case "ArrowLeft":
                case "KeyA":
                    this.keys.left = false;
                    break;
                case "ArrowRight":
                case "KeyD":
                    this.keys.right = false;
                    break;
                case "Space":
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