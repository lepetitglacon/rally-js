import * as BABYLON from "@babylonjs/core";
import {AudioEngineV2, type Scene} from "@babylonjs/core";
import GameEngine from "../GameEngine.ts";

import engineSound from '@/assets/sound/engine.wav'

export default class SoundManager {
    static _instance: SoundManager = null;
    private sounds: {};
    private scene: Scene;
    private masterVolume: number;
    private audioEngine: AudioEngineV2;

    static getInstance() {
        if (!SoundManager._instance) {
            SoundManager._instance = new SoundManager();
        }
        return SoundManager._instance;
    }

    constructor() {
        this.sounds = {}; // Dictionary to store loaded sounds
        this.scene = GameEngine.scene;
        this.masterVolume = 1.0;
    }

    async init() {
        // V2
        // this.audioEngine = await BABYLON.CreateAudioEngineAsync();
        // await this.audioEngine.unlock();

        // V1
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        window.addEventListener(
            "click",
            () => {
                if (!BABYLON.Engine.audioEngine.unlocked) {
                    BABYLON.Engine.audioEngine.unlock();
                }
            },
            { once: true },
        );

        // load sounds
        this.loadSound('engine', engineSound, {loop: true, spatial: true})

        // attach sounds to meshes
        GameEngine.eventManager.onCarLoader.add((car) => {
            this.sounds['engine'].attachToMesh(car.chassisMesh)
        })

        // game related bindings
        GameEngine.eventManager.onCarEngineStart.add(() => { this.play('engine') })
        GameEngine.eventManager.onCarEngineStop.add(() => { this.stop('engine') })
    }

    update() {
        const minRate = 1;
        const maxRate = 2.5;
        const minRpm = 0
        const clampedRPM = Math.min(GameEngine.car.engine.maxRpm, Math.max(minRpm, GameEngine.car.engine.engineTorque));
        const t = (clampedRPM - minRpm) / (GameEngine.car.engine.maxRpm - minRpm);
        const rate = minRate + t * (maxRate - minRate);
        this.sounds['engine'].setPlaybackRate(rate)
    }

    loadSound(name, url, options = {}) {
        if (!this.scene) throw new Error("SoundManager not initialized with a scene.");

        const sound = new BABYLON.Sound(name, url, this.scene, null, {
            loop: options.loop || false,
            autoplay: options.autoplay || false,
            volume: options.volume !== undefined ? options.volume : this.masterVolume,
            spatialSound: options.spatial || false,
        });

        this.sounds[name] = sound;
        console.log(`sound "${name}" loaded`)
    }

    play(name, options = {}) {
        const sound = this.sounds[name];
        if (!sound) {
            console.warn(`Sound '${name}' not found.`);
            return;
        }

        if (options.loop !== undefined) sound.loop = options.loop;
        if (options.volume !== undefined) sound.setVolume(options.volume);

        sound.play();
    }

    stop(name) {
        const sound = this.sounds[name];
        if (sound) sound.stop();
    }

    pause(name) {
        const sound = this.sounds[name];
        if (sound) sound.pause();
    }

    setVolume(name, volume) {
        const sound = this.sounds[name];
        if (sound) sound.setVolume(volume);
    }

    setMasterVolume(volume) {
        this.masterVolume = volume;
        for (const sound of Object.values(this.sounds)) {
            sound.setVolume(volume);
        }
    }

    dispose() {
        for (const sound of Object.values(this.sounds)) {
            sound.dispose();
        }
        this.sounds = {};
    }
}