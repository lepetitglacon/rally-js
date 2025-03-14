import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import engine_sound from '@/assets/sound/engine.mp3?url'
import GameEngine from "./GameEngine.ts";
import type Car from "./Car.ts";
import {Lerp} from "@babylonjs/core/Maths/math.scalar.functions";

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
    public brake: number;

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
    public engineTorque: number;
    public wheelTorque: number;
    public wheelSpeed: number;
    private wheelRadius: number;
    private differentialRatio: number;
    private slider: GUI.Slider;
    private header: GUI.TextBlock;

    constructor(car: Car) {
        this.car = car

        this.currentRPM = 0;
        this.maxRPM = 7000; // Max engine RPM
        this.idleRPM = 800; // Idle RPM
        this.redlineRPM = 6500; // Engine redline

        this.gearRatios = [0, 3.636, 2.375, 1.761, 1.346, 0.971, 0.756]; // 0 = Neutral, 1-6 gears
        this.currentGear = 0; // Start in neutral

        this.wheelRadius = 0.34; // Meters
        this.wheelTorque = 0;
        this.wheelSpeed = 0;
        this.engineTorque = 0;
        this.differentialRatio = 3.9;
        this.torqueCurve = {
            1000: 100, 2000: 180, 3000: 220,
            4000: 250, 5000: 240, 6000: 200, 7000: 150
        };

        this.engineRunning = false;
        this.throttle = 0; // Throttle percentage (0 - 1)
        this.brake = 0;

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

        var panel = new GUI.StackPanel();
        panel.width = "220px";
        panel.height = "220px";
        panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        GameEngine.gui.addControl(panel);

        this.header = new GUI.TextBlock();
        this.header.text = "RPM";
        this.header.height = "30px";
        this.header.color = "white";
        panel.addControl(this.header);

        this.slider = new GUI.Slider();
        this.slider.minimum = 0;
        this.slider.maximum = this.maxRPM;
        this.slider.value = 0;
        this.slider.height = "200px";
        this.slider.width = "20px";
        this.slider.isVertical = true
        // slider.onValueChangedObservable.add(function(value) {
        //     header.text = "Y-rotation: " + (BABYLON.Tools.ToDegrees(value) | 0) + " deg";
        //     if (skull) {
        //         skull.rotation.y = value;
        //     }
        // });
        panel.addControl(this.slider);

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

            if (!BABYLON.Engine.audioEngine.unlocked) {
                BABYLON.Engine.audioEngine.unlock();
            }

            console.log(this.engineSound.isReady());
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
        if (!this.engineRunning) return;

        let targetRPM = 0
        if (this.currentGear === 0) {
            targetRPM = this.idleRPM + this.throttle * (this.maxRPM - this.idleRPM);
        } else {
            let ratio = this.gearRatios[this.currentGear];
            targetRPM = this.idleRPM + this.throttle * (this.maxRPM - this.idleRPM) / ratio
        }

        this.currentRPM = targetRPM
        this.currentRPM = Math.max(this.idleRPM, Math.min(this.currentRPM, this.maxRPM));

        // Simulate Redline Effect
        if (this.currentRPM >= this.redlineRPM) {
            console.log("🔴 Engine hitting redline! Shift up!");
        }
    }


    // Get engine torque based on current RPM
    updateTorque() {
        if (!this.engineRunning) return;

        let keys = Object.keys(this.torqueCurve).map(Number);
        let lower = keys.find(k => k <= this.currentRPM) ?? keys[0];
        let upper = keys.find(k => k >= this.currentRPM) ?? keys[keys.length - 1];

        if (lower === upper) return this.torqueCurve[lower];

        // Linear interpolation
        let t1 = this.torqueCurve[lower];
        let t2 = this.torqueCurve[upper];
        let ratio = (this.currentRPM - lower) / (upper - lower);
        this.engineTorque = t1 + ratio * (t2 - t1);
    }

    // Calculate force applied to the wheels
    updateWheelForce() {
        if (!this.engineRunning) return;
        if (this.currentGear === 0) return this.wheelTorque = 0; // No force in neutral

        this.wheelTorque = this.engineTorque * this.gearRatios[this.currentGear] * this.differentialRatio;
        console.log(this.wheelTorque)
        this.wheelSpeed = (this.wheelTorque / this.wheelRadius) * this.throttle;
    }

    // Update RPM based on throttle and gear
    update() {

        this.updateRPM()
        this.updateTorque()
        this.updateWheelForce()
        this.engineSound.setPlaybackRate(1 + this.currentRPM / this.maxRPM)

        this.header.text = 'RPM ' + this.currentRPM
        this.slider.value = this.currentRPM
    }
}