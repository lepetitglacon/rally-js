import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import Car from "./Car.ts";
import Map from "./Map.ts";
import CameraManager from "./CameraManager.ts";
import InputManager from "./InputManager.ts";
import {registerBuiltInLoaders} from "@babylonjs/loaders/dynamic";

class GameEngine {
    private canvas: HTMLCanvasElement;
    public scene: BABYLON.Scene;
    public engine: BABYLON.Engine;

    private map: Map;
    private car: Car;
    private gui: GUI.AdvancedDynamicTexture;
    private cameraManager: CameraManager;
    private inputManager: InputManager;

    constructor() {}

    async init() {
        this.initEngine()
        this.initScene()

        this.gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.cameraManager = new CameraManager()
        this.inputManager = new InputManager()
        registerBuiltInLoaders()
        this.map = new Map()
        this.car = new Car()

        this.scene.onBeforeRenderObservable.add(() => {
            this.inputManager.update()
            this.cameraManager.update()
            this.map.update()
            this.car.update()
        })

        this.engine.runRenderLoop(() => this.scene.render());
    }

    private initEngine() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true, {
            audioEngine: true
        });
        window.addEventListener("resize", () => this.engine.resize());
        // sound
        // BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        // window.addEventListener(
        //     "click",
        //     () => {
        //       if (!BABYLON.Engine.audioEngine.unlocked) {
        //         BABYLON.Engine.audioEngine.unlock();
        //       }
        //     },
        //     { once: true },
        // );
    }
    private initScene() {
        const scene = new BABYLON.Scene(this.engine);
        this.scene = scene
        scene.actionManager = new BABYLON.ActionManager(scene);

        const hemisphereLight = new BABYLON.HemisphericLight("light",
            new BABYLON.Vector3(0, 1, 0), scene);
        hemisphereLight.intensity = 0.7;
        // const light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
        // light.position.y = 50
        // const shadowGenerator = new BABYLON.ShadowGenerator(2048, light, true, scene.activeCamera);
        // shadowGenerator.useContactHardeningShadow = true;
    }

    async dispose() {
        this.scene.dispose()
        this.engine.dispose()
    }

}
const ge =  new GameEngine()
export default ge;
export const scene = ge.scene