import {GamepadManager, Gamepad, Xbox360Pad, Xbox360Button, Vector3} from "@babylonjs/core";
import GameEngine from "@/game/GameEngine.ts";

export default class InputManager {
    public keys: {
        throttle: number;
        brake: number;
        steering: number,
        right: number
        left: number;
        handbrake: number;
        shift: number;
        freeView: Vector3
    };
    private keyMap: {
        throttle: string,
        brake: string,
        left: string,
        right: string,
        handbrake: string,
        shift: string,
    };
    private gamepadManager: GamepadManager;
    public gamepad: undefined|Gamepad;

    public deadZoneMinX: number = 0.1;
    public deadZoneMaxX: number = .8;

    constructor() {
        this.keys = {
            throttle: 0,
            brake: 0,
            steering: 0,
            left: 0,
            right: 0,
            handbrake: 0,
            shift: 0,
            freeView: new Vector3()
        };

        // TODO keymap
        this.keyMap = {
            throttle: 'z',
            brake: 's',
            left: 'q',
            right: 'd',
            handbrake: ' ',
            shift: 'Shift',
        }

        this.gamepadManager = new GamepadManager()
        this.setupKeyboard();
        this.setupGamepad();

    }

    setupKeyboard() {
        window.addEventListener("keydown", (event) => {
            switch (event.key) {
                case this.keyMap.throttle:
                    this.keys.throttle = 1;
                    break;
                case this.keyMap.brake:
                    this.keys.brake = 1;
                    break;
                case this.keyMap.left:
                    // this.keys.left = 1;
                    this.keys.steering = -1;
                    break;
                case this.keyMap.right:
                    // this.keys.right = 1;
                    this.keys.steering = 1;
                    break;
                case this.keyMap.handbrake: // Handbrake
                    this.keys.handbrake = 1;
                    break;
                case this.keyMap.shift: // Handbrake
                    this.keys.shift = 1;
                    break;
            }
        });
        window.addEventListener("keyup", (event) => {
            switch (event.key) {
                case this.keyMap.throttle:
                    this.keys.throttle = 0;
                    break;
                case this.keyMap.brake:
                    this.keys.brake = 0;
                    break;
                case this.keyMap.left:
                    this.keys.left = 0;
                    break;
                case this.keyMap.right:
                    this.keys.right = 0;
                    break;
                case this.keyMap.handbrake: // Handbrake
                    this.keys.handbrake = 0;
                    break;
                case this.keyMap.shift: // Handbrake
                    this.keys.shift = 0;
                    break;
            }
        });
    }

    setupGamepad() {
        this.gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
            console.info(`Gamepad connected: ${gamepad.id}`)
            this.gamepad = gamepad
            if(this.gamepad instanceof Xbox360Pad) {
                this.gamepad.onButtonDownObservable.add((buttonKey) => {
                    switch (buttonKey) {
                        case Xbox360Button.Start: { GameEngine.eventManager.onControllerStartButton.notifyObservers({}); break; }
                        case Xbox360Button.B: { GameEngine.eventManager.onControllerHandbrakeButton.notifyObservers({}); break; }
                        case Xbox360Button.A: { GameEngine.eventManager.onControllerAButton.notifyObservers({}); break; }
                        case Xbox360Button.X: { GameEngine.eventManager.onControllerXButton.notifyObservers({}); break; }
                    }
                })
            }
        });
        this.gamepadManager.onGamepadDisconnectedObservable.add((gamepad, state) => {
            console.info(`Gamepad disconnected: ${gamepad.id}`)
            this.gamepad = undefined
        });
    }

    update() {
        if(this.gamepad instanceof Xbox360Pad) {
            // if(this.gamepad.buttonA) { this.keys.shift = 1 } else { this.keys.shift = 0 }
            if(this.gamepad.buttonB) { this.keys.handbrake = 1 } else { this.keys.handbrake = 0 }
            // if(this.gamepad.buttonX) { this.keys.throttle = 1 } else { this.keys.throttle = 0 }
            // if(this.gamepad.buttonY) { this.keys.brake = 1 } else { this.keys.brake = 0 }
            this.keys.throttle = this.gamepad.rightTrigger
            this.keys.brake = this.gamepad.leftTrigger
            this.keys.steering = this.gamepad.leftStick.x
            this.keys.freeView.set(this.gamepad.rightStick.x, this.gamepad.rightStick.y, 0)
        }
    }
}