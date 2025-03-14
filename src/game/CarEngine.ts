import * as BABYLON from "@babylonjs/core";
import engine_sound from '@/assets/sound/engine.mp3?url'
import GameEngine from "./GameEngine.ts";
import type Car from "./Car.ts";

export default class CarEngine {
    private car: Car;
    private engineRunning: boolean;

    private maxRPM: number;
    private idleRPM: number;
    private currentRPM: number;
    private redlineRPM: number;

    private gearRatios: number[];
    private currentGear: number;

    throttle: number;
    private braking: boolean;
    private engineSound: BABYLON.Sound;
    private torqueCurve: {
        7000: number;
        5000: number;
        6000: number;
        4000: number;
        1000: number;
        2000: number;
        3000: number
    };
    private wheelRadius: number;
    private differentialRatio: number;

    constructor(car: Car) {
        this.car = car

        this.maxRPM = 7000; // Max engine RPM
        this.idleRPM = 800; // Idle RPM
        this.currentRPM = 0;

        this.gearRatios = [0, 3.636, 2.375, 1.761, 1.346, 0.971, 0.756]; // 0 = Neutral, 1-6 gears
        this.currentGear = 0; // Start in neutral
        this.redlineRPM = 6500; // Engine redline

        this.wheelRadius = 0.34; // Meters
        this.differentialRatio = 3.9;

        this.torqueCurve = {
            1000: 100, 2000: 180, 3000: 220,
            4000: 250, 5000: 240, 6000: 200, 7000: 150
        };

        this.engineRunning = false;
        this.throttle = 0; // Throttle percentage (0 - 1)
        this.braking = false;

        const engineSound = new BABYLON.Sound(
            "engine",
            engine_sound,
            GameEngine.scene,
            null,
            {
            loop: true,
            volume: 1
        });
        this.engineSound = engineSound

        GameEngine.scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.event.button === 0) {
                        this.shiftGear(this.currentGear + 1)
                    }
                    if (pointerInfo.event.button === 2) {
                        this.shiftGear(this.currentGear - 1)
                    }
                    break;
            }
        });
    }

    startStopEngine() {
        if (this.engineRunning) {
            this.engineRunning = false;
            this.currentRPM = 0;
            console.log("🛑 Engine stopped.");
            this.engineSound.stop()
        } else {
            this.engineRunning = true;
            this.currentRPM = this.idleRPM;
            this.engineSound.play()
            console.log("🚗 Engine started. RPM:", this.currentRPM);
        }
    }

    // Shift gears (1-6 or 0 for neutral)
    shiftGear(gear) {
        if (gear < 0 || gear >= this.gearRatios.length) return;
        this.currentGear = gear;
        console.log(`⚙️ Shifted to Gear ${this.currentGear}`);
    }

    updateRPM() {
        if (this.braking) {
            this.currentRPM -= 100; // Simulated braking effect
        } else if (this.currentGear > 0) {
            let ratio = this.gearRatios[this.currentGear];
            this.currentRPM = this.idleRPM + this.throttle * (this.maxRPM - this.idleRPM) / ratio;
        } else {
            this.currentRPM = this.idleRPM + this.throttle * (this.maxRPM - this.idleRPM) * 0.2; // Neutral revving
        }

        // Clamp RPM
        this.currentRPM = Math.max(this.idleRPM, Math.min(this.currentRPM, this.maxRPM));

        // Simulate Redline Effect
        if (this.currentRPM >= this.redlineRPM) {
            console.log("🔴 Engine hitting redline! Shift up!");
        }
    }


    // Get engine torque based on current RPM
    updateTorque() {
        let keys = Object.keys(this.torqueCurve).map(Number);
        let lower = keys.find(k => k <= this.currentRPM) || keys[0];
        let upper = keys.find(k => k >= this.currentRPM) || keys[keys.length - 1];

        if (lower === upper) return this.torqueCurve[lower];

        // Linear interpolation
        let t1 = this.torqueCurve[lower];
        let t2 = this.torqueCurve[upper];
        let ratio = (this.currentRPM - lower) / (upper - lower);
        return t1 + ratio * (t2 - t1);
    }

    // Calculate force applied to the wheels
    updateWheelForce() {
        if (this.currentGear === 0) return 0; // No force in neutral

        let engineTorque = this.updateTorque();
        let wheelTorque = engineTorque * this.gearRatios[this.currentGear] * this.differentialRatio;
        let force = (wheelTorque / this.wheelRadius) * this.throttle;

        return force;
    }

    // Update RPM based on throttle and gear
    update() {
        if (!this.engineRunning) return;
        this.updateRPM()
        this.updateTorque()
        this.updateWheelForce()
        this.engineSound.setPlaybackRate(this.currentRPM / this.maxRPM)
    }
}