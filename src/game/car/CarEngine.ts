import * as BABYLON from "@babylonjs/core";
import type {RaycastVehicle} from "objects/RaycastVehicle";
import GameEngine from "../GameEngine.ts";
import type {TextBlock} from "@babylonjs/gui";

interface EngineOptions {
    maxRpm?: number;
    idleRpm?: number;
    redlineRpm?: number;
    maxTorque?: number;
    engineBraking?: number;
    gearRatios?: number[];
    differentialRatio?: number;
    wheelRadius?: number;
}

// Interface for Engine information
interface EngineInfo {
    rpm: number;
    gear: number;
    throttle: number;
    clutch: number;
}

class Engine {
    // Engine parameters
    maxRpm: number;
    idleRpm: number;
    redlineRpm: number;
    maxTorque: number;
    engineBraking: number;

    // Transmission parameters
    torqueCurve: { rpm: number, torque: number }[];
    gearRatios: number[];
    differentialRatio: number;
    currentGear: number;

    // Vehicle parameters
    wheelRadius: number;

    // Runtime state
    currentRpm: number;
    throttleInput: number;
    clutchInput: number;

    // Vehicle reference
    vehicle: RaycastVehicle | null;
    gearGui: { header: TextBlock; onUpdate: (headerValue, sliderValue) => void };
    running: boolean;
    engineTorque: number;
    finalDrive: number;
    wheelTorque: number;

    /**
     * Class representing a vehicle engine that manages power transfer between engine and wheels
     * @param {EngineOptions} options - Engine configuration options
     */
    constructor(options: EngineOptions = {}) {
        // Engine parameters
        this.maxRpm = options.maxRpm || 7500;
        this.idleRpm = options.idleRpm || 800;
        this.redlineRpm = options.redlineRpm || 6500;
        this.maxTorque = options.maxTorque || 350;
        this.engineBraking = options.engineBraking || 0.2;

        // Transmission parameters
        this.torqueCurve = [
            { rpm: 1000, torque: 120 },
            { rpm: 2000, torque: 180 },
            { rpm: 3000, torque: 230 },
            { rpm: 4000, torque: 250 },
            { rpm: 5000, torque: 240 },
            { rpm: 6000, torque: 220 },
        ];
        this.gearRatios = options.gearRatios || [0, 3.5, 2.5, 1.8, 1.3, 1.0, 0.8];
        this.finalDrive = 3.42;
        this.differentialRatio = options.differentialRatio || 3.42;
        this.currentGear = 0;

        // Vehicle parameters
        this.wheelRadius = options.wheelRadius || 0.35; // meters

        // Runtime state
        this.running = false;
        this.currentRpm = 0;
        this.throttleInput = 0;
        this.clutchInput = 0; // 0 = fully engaged, 1 = fully disengaged
        this.engineTorque = 0
        this.wheelTorque = 0

        // Vehicle reference (to be set later)
        this.vehicle = null;

        this.compteur = GameEngine.gui.createCarThrottle()
        this.gearGui = GameEngine.gui.createSlider()
        this.speedGui = GameEngine.gui.createSlider()

        this.rpmGui = GameEngine.gui.createSlider()
        this.throttleGui = GameEngine.gui.createSlider()
        this.engineTorqueGui = GameEngine.gui.createSlider()
        this.wheelTorqueGui = GameEngine.gui.createSlider()

        GameEngine.scene.onPointerObservable.add((e) => {
            if (GameEngine.inputManager.gamepad) return
            if (e.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                switch (e.event.button) {
                    case 0:
                        this.shiftUp()
                        break;
                    case 2:
                        this.shiftDown()
                        break;
                }
            }
        })
        GameEngine.eventManager.onControllerAButton.add(() => { this.shiftUp() })
        GameEngine.eventManager.onControllerXButton.add(() => { this.shiftDown() })
    }

    public attachToVehicle(vehicle: RaycastVehicle): void {
        if (!vehicle) {
            throw new Error("Vehicle cannot be null");
        }
        this.vehicle = vehicle;
    }

    startStopEngine() {
        if (!this.running) {
            this.running = true
            GameEngine.eventManager.onCarEngineStart.notifyObservers({})
        } else {
            this.running = false
            GameEngine.eventManager.onCarEngineStop.notifyObservers({})
        }
    }

    public setThrottle(value: number): void {
        this.throttleInput = value;
    }
    public shiftUp(): boolean {
        if (this.currentGear < this.gearRatios.length - 1) {
            this.currentGear++;
            return true;
        }
        return false;
    }
    public shiftDown(): boolean {
        if (this.currentGear > 0) {
            this.currentGear--;
            return true;
        }
        return false;
    }

    public update(deltaTime: number): void {
        if (!this.vehicle) { return }
        if (!this.running) { return }

        let totalWheelRPM = 0;
        for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
            const wheel = this.vehicle.wheelInfos[i];
            const radPerSec = wheel.deltaRotation / deltaTime;
            const rpm = radPerSec * (60 / (2 * Math.PI));
            totalWheelRPM += rpm;
        }
        const avgWheelRPM = totalWheelRPM / this.vehicle.wheelInfos.length;

        // --- Compute engine RPM
        const wheelRPM = avgWheelRPM * this.gearRatios[this.currentGear] * this.finalDrive;
        this.currentRpm = BABYLON.Scalar.Lerp(this.currentRpm, wheelRPM, 0.1); // Slowly sync to wheels
        const throttleTargetRPM = BABYLON.Scalar.Lerp(this.idleRpm, this.maxRpm, this.throttleInput);
        if (throttleTargetRPM > this.currentRpm) {
            this.currentRpm += (throttleTargetRPM - this.currentRpm) * 0.2;
        }
        this.currentRpm = BABYLON.Scalar.Clamp(this.currentRpm, this.idleRpm, this.maxRpm);

        // let targetRPM = avgWheelRPM * this.gearRatios[this.currentGear] * this.finalDrive;
        // if (targetRPM < 800) {
        //     targetRPM = BABYLON.Scalar.Lerp(800, this.maxRpm, this.throttleInput);
        // }
        // this.currentRpm = BABYLON.Scalar.Clamp(targetRPM, 800, this.maxRpm);

        this.engineTorque = 0;
        for (let i = 0; i < this.torqueCurve.length - 1; i++) {
            const p1 = this.torqueCurve[i];
            const p2 = this.torqueCurve[i + 1];
            if (this.currentRpm >= p1.rpm && this.currentRpm <= p2.rpm) {
                const t = (this.currentRpm - p1.rpm) / (p2.rpm - p1.rpm);
                this.engineTorque = BABYLON.Scalar.Lerp(p1.torque, p2.torque, t);
                break;
            }
        }
        if (this.currentRpm < this.torqueCurve[0].rpm) this.engineTorque = this.torqueCurve[0].torque;
        if (this.currentRpm > this.torqueCurve[this.torqueCurve.length - 1].rpm) this.engineTorque = this.torqueCurve[this.torqueCurve.length - 1].torque;

        this.engineTorque *= this.throttleInput;

        // --- Apply torque to driven wheels
        this.wheelTorque = this.engineTorque * this.gearRatios[this.currentGear] * this.finalDrive * 2;

        if (this.throttleInput === 0 && avgWheelRPM > 10) {
            this.wheelTorque += -30; // Try values between -10 and -100
        }

        // --- Optional: debug log
        // console.log(`
        //     Throttle: ${this.throttleInput},
        //     Gear: ${this.currentGear},
        //     RPM: ${this.currentRpm.toFixed(0)},
        //     Torque: ${this.engineTorque.toFixed(1)},
        //     Wheel Torque: ${this.wheelTorque.toFixed(1)}
        // `);
    }
}

export default Engine;