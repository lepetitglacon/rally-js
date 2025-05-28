import * as BABYLON from "@babylonjs/core";
import type {RaycastVehicle} from "objects/RaycastVehicle";
import GameEngine from "./GameEngine.ts";
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
        this.gearRatios = options.gearRatios || [3.5, 2.5, 1.8, 1.3, 1.0, 0.8];
        this.differentialRatio = options.differentialRatio || 3.42;
        this.currentGear = 0;

        // Vehicle parameters
        this.wheelRadius = options.wheelRadius || 0.35; // meters

        // Runtime state
        this.running = false;
        this.currentRpm = this.idleRpm;
        this.throttleInput = 0;
        this.clutchInput = 0; // 0 = fully engaged, 1 = fully disengaged
        this.rpm = 0; // 0 = fully engaged, 1 = fully disengaged
        this.engineTorque = 0; // 0 = fully engaged, 1 = fully disengaged

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
    }

    /**
     * Connect this engine to a Cannon.js raycast vehicle
     * @param {RaycastVehicle} vehicle - Cannon-ES RaycastVehicle instance
     */
    public attachToVehicle(vehicle: RaycastVehicle): void {
        if (!vehicle) {
            throw new Error("Vehicle cannot be null");
        }
        this.vehicle = vehicle;
    }

    startStopEngine() {
        if (this.running) {
            this.running = false
        } else {
            this.running = true
        }
    }

    /**
     * Set throttle input (0.0 to 1.0)
     * @param {number} value - Throttle input (0 = no throttle, 1 = full throttle)
     */
    public setThrottle(value: number): void {
        this.throttleInput = Math.max(0, Math.min(1, value));
    }

    /**
     * Set clutch input (0.0 to 1.0)
     * @param {number} value - Clutch input (0 = fully engaged, 1 = fully disengaged)
     */
    public setClutch(value: number): void {
        this.clutchInput = Math.max(0, Math.min(1, value));
    }

    /**
     * Set current gear (0-based index into gearRatios array)
     * @param {number} gear - Gear number (0-based)
     */
    public setGear(gear: number): void {
        if (gear >= 0 && gear < this.gearRatios.length) {
            this.currentGear = gear;
        }
    }

    /**
     * Shift to next higher gear if possible
     * @returns {boolean} - True if shift was successful
     */
    public shiftUp(): boolean {
        if (this.currentGear < this.gearRatios.length - 1) {
            this.currentGear++;
            return true;
        }
        return false;
    }

    /**
     * Shift to next lower gear if possible
     * @returns {boolean} - True if shift was successful
     */
    public shiftDown(): boolean {
        if (this.currentGear > 0) {
            this.currentGear--;
            return true;
        }
        return false;
    }

    /**
     * Calculate engine torque based on current RPM and throttle position
     * @returns {number} - Engine torque in Nm
     */
    private calculateEngineTorque(): number {
        // Simple torque curve simulation
        // Max torque at redline RPM, linear up to that point, then falling off
        let torqueRatio: number;

        if (this.currentRpm < this.idleRpm) {
            torqueRatio = 0.1; // Minimal torque below idle
        } else if (this.currentRpm <= this.redlineRpm) {
            // Linear increase up to redline
            torqueRatio = 0.2 + 0.8 * ((this.currentRpm - this.idleRpm) / (this.redlineRpm - this.idleRpm));
        } else {
            // Torque falls off after redline
            const overRevFactor = Math.max(0, 1 - (this.currentRpm - this.redlineRpm) / (this.maxRpm - this.redlineRpm));
            torqueRatio = Math.max(0.1, overRevFactor);
        }

        return this.maxTorque * torqueRatio * this.throttleInput;
    }

    /**
     * Update the engine state based on vehicle state
     * @param {number} deltaTime - Time step in seconds
     */
    public update(deltaTime: number): void {
        if (!this.vehicle) {
            return;
        }

        // Calculate engine torque and wheel torque
        const engineTorque = this.calculateEngineTorque() * 100;
        this.engineTorque = engineTorque

        // Apply engine force to wheels
        for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {

            if (GameEngine.inputManager.keys.brake) {
                this.vehicle.setBrake(25, i);
            } else {
                this.vehicle.setBrake(0, i);
            }
            //
            this.throttleInput < 0.01 ? this.vehicle.applyEngineForce(0, i) : this.vehicle.applyEngineForce(-engineTorque, i)
        }

        this.updateGui()
    }


    updateGui() {
        this.gearGui.onUpdate(':gear ' + this.currentGear)
        this.speedGui.onUpdate(':speed ' + this.vehicle?.currentVehicleSpeedKmHour.toFixed(2))
        this.rpmGui.onUpdate(':rpm ' + this.currentRpm.toFixed(2))
        this.throttleGui.onUpdate(':throttle ' + this.throttleInput.toFixed(2))
        this.engineTorqueGui.onUpdate(':engineTorqueGui ' + this.calculateEngineTorque().toFixed(2))
    }
    /**
     * Get current engine information
     * @returns {EngineInfo} - Object containing engine state information
     */
    public getEngineInfo(): EngineInfo {
        return {
            rpm: this.currentRpm,
            gear: this.currentGear + 1, // Convert 0-based to 1-based for display
            throttle: this.throttleInput,
            clutch: this.clutchInput
        };
    }
}

export default Engine;