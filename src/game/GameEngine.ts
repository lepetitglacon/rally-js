import * as BABYLON from "@babylonjs/core";
import Stage from "./Stage.ts";
import Car from "./Car.ts";
import CameraManager from "./CameraManager.ts";
import InputManager from "./InputManager.ts";
import {registerBuiltInLoaders} from "@babylonjs/loaders/dynamic";
import Gui from "./Gui.ts";
import EventManager from "./EventManager.ts";

class GameEngine {
    public canvas: HTMLCanvasElement;
    public scene: BABYLON.Scene;
    public engine: BABYLON.Engine;

    public map: Stage;
    public car: Car;
    gui: Gui;
    cameraManager: CameraManager;
    inputManager: InputManager;
    eventManager: EventManager;
    gamepadManager: BABYLON.GamepadManager;

    constructor() {}

    async init() {
        await this.initEngine()
        await this.initScene()

        this.eventManager = new EventManager()

        this.gui = new Gui()

        this.cameraManager = new CameraManager()
        this.inputManager = new InputManager()
        registerBuiltInLoaders()
        this.map = new Stage()
        this.car = new Car()

        await this.map.initAsync()
        await this.car.initAsync()

        this.car.setInitialPosition(this.map.startMesh.getAbsolutePosition())

        this.scene.onBeforeRenderObservable.add(() => {
            this.inputManager.update()
            this.cameraManager.update()
            this.map.update()
            this.car.update()
            this.gui.update()
        })

        this.engine.runRenderLoop(() => this.scene.render());
    }

    private initEngine() {
        return new Promise((res): void => {
            this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
            this.engine = new BABYLON.Engine(this.canvas, true, {
                audioEngine: true,
                adaptToDeviceRatio: true,
            });
            window.addEventListener("resize", () => this.engine.resize());
            return res()
        })

        // sound
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
    }
    private initScene() {
        return new Promise((res): void => {
            const scene = new BABYLON.Scene(this.engine);
            this.scene = scene
            scene.actionManager = new BABYLON.ActionManager(scene);

            const hemisphereLight = new BABYLON.HemisphericLight("light",
                new BABYLON.Vector3(0, 1, 0), scene);
            hemisphereLight.intensity = 0.7;
            const light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
            light.position.y = 50
            const shadowGenerator = new BABYLON.ShadowGenerator(2048, light, true, scene.activeCamera);
            shadowGenerator.useContactHardeningShadow = true;
            return res()
        })
    }

    async dispose() {
        this.scene.dispose()
        this.engine.dispose()
    }

}
let gameEngine = new GameEngine()
export default gameEngine;
export const scene = gameEngine.scene