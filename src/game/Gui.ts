import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import GameEngine from "./GameEngine.ts";
import {RunState} from "./Stage.ts";
import {TextBlock} from "@babylonjs/gui";
import {Color3, Vector2} from "@babylonjs/core";

class InputConnectedKeyboard extends GUI.VirtualKeyboard {

    constructor() {
        super();
    }
}

export default class Gui {
    private gui: GUI.AdvancedDynamicTexture;
    private infoPanel: GUI.StackPanel;
    private updateFunctions: Map<string, Function>;
    private startTime: DOMHighResTimeStamp;
    private gameTimerText: TextBlock;

    constructor() {
        this.updateFunctions = new Map<string, Function>()
        this.gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.infoPanel = new GUI.StackPanel();
        this.infoPanel.isVertical = true;
        this.infoPanel.width = "500px";
        this.infoPanel.height = "500px";
        this.infoPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.infoPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.infoPanel.color = new BABYLON.Color4(0, 0, 0, .5)
        this.gui.addControl(this.infoPanel);

        const keyboard = new InputConnectedKeyboard();
        keyboard.addKeysRow(['z','q','s','d',])
        keyboard.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
        keyboard.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.gui.addControl(keyboard);

        this.startTime = performance.now(); // or Date.now(), but performance.now() is better
        this.gameTimerText = new GUI.TextBlock();
        this.gameTimerText.text = "0";
        this.gameTimerText.height = "30px";
        this.gameTimerText.color = "white";
        this.gameTimerText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.gameTimerText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        const startHandbrakeText = new GUI.TextBlock();
        startHandbrakeText.text = "Appuyez sur le frein main [espace] pour commencer";
        startHandbrakeText.height = "30px";
        startHandbrakeText.color = "white";
        startHandbrakeText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        startHandbrakeText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        GameEngine.eventManager.onCarInitialized.add(() => {
            this.gui.addControl(startHandbrakeText)
        })
        GameEngine.eventManager.onUserHandBreakForTheFirstTime.add(() => {
            startHandbrakeText.dispose()
            const header = new GUI.TextBlock();
            header.text = "5";
            header.height = "30px";
            header.color = "white";
            header.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            header.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.gui.addControl(header)

            // countdown début de la run
            let startTimer = 5
            const startInterval = setInterval(() => {
                startTimer -= 1
                header.text = startTimer
                if (startTimer === 0) {
                    clearInterval(startInterval)
                    header.text  = 'GO'
                    GameEngine.eventManager.onRunStart.notifyObservers({})
                    setTimeout(() => {
                        header.dispose()
                    }, 2000)
                    return
                }
            }, 1000)
        })
        GameEngine.eventManager.onRunStart.add(() => {
            this.gui.addControl(this.gameTimerText)
            this.startTime = performance.now()
        })
        GameEngine.eventManager.onRunEnd.add(() => {
            const header = new GUI.TextBlock();
            header.text = "Arrivé !";
            header.height = "30px";
            header.color = "white";
            header.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            header.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.gui.addControl(header)
        })
    }

    createSlider(min = 0, max = 10000) {
        const container = new GUI.StackPanel();
        container.isVertical = false;
        container.width = "30px";
        container.height = "200px";
        container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        const header = new GUI.TextBlock();
        header.text = "RPM";
        header.height = "30px";
        header.color = "white";
        container.addControl(header)

        const slider = new GUI.Slider();
        slider.minimum = min;
        slider.maximum = max;
        slider.value = min;
        slider.height = "200px";
        slider.width = "50px";
        slider.isVertical = true
        container.addControl(slider);

        this.infoPanel.addControl(header)

        function onUpdate(headerValue, sliderValue) {
            header.text = headerValue ?? header.text;
            slider.value = sliderValue ?? slider.value;
        }

        return {
            header,
            slider,
            onUpdate
        }
    }

    createCarThrottle() {
        const padding = 50
        const size = 300
        const container = new GUI.Rectangle();
        container.width = `${size + padding}px`;
        container.height = `${size + padding}px`;
        container.thickness = 0;
        container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        container.paddingRight = `${padding}px`;
        container.paddingBottom = `${padding}px`;
        this.gui.addControl(container);

        const offsetX = 300/2;
        const offsetY = 300/2;

        function drawArc(container, startDeg, endDeg, radius, color, steps = 150, width = 10) {
            const step = (endDeg - startDeg) / steps;
            for (let i = 0; i < steps; i++) {
                const a1 = BABYLON.Angle.FromDegrees(startDeg + 90 + i * step).radians();
                const a2 = BABYLON.Angle.FromDegrees(startDeg + 90 + (i + 1) * step).radians();
                const p1 = new BABYLON.Vector2(Math.cos(a1), Math.sin(a1)).scale(radius);
                const p2 = new BABYLON.Vector2(Math.cos(a2), Math.sin(a2)).scale(radius);
                const line = new GUI.Line();
                line.x1 = p1.x + offsetX;
                line.y1 = -p1.y + offsetY;
                line.x2 = p2.x + offsetX;
                line.y2 = -p2.y + offsetY;
                line.color = color;
                line.lineWidth = width;
                container.addControl(line);
            }
        }
        const start = 90
        const middleStart = 0
        const middleEnd = -45
        const end = -90
        drawArc(container, start, middleStart, 100, "green");
        drawArc(container, middleStart, middleEnd, 100, "orange");
        drawArc(container, middleEnd, end, 100, "red");

        const needle = new GUI.Line();
        needle.x1 = 0;
        needle.y1 = 0;
        needle.lineWidth = 3;
        needle.color = "white";
        container.addControl(needle);

        function setNeedle(angleDeg, length = 90) {
            const rad = BABYLON.Angle.FromDegrees(angleDeg + 90).radians();
            const dir = new BABYLON.Vector2(Math.cos(rad), Math.sin(rad)).scale(length);
            needle.x1 = offsetX;
            needle.y1 = offsetY;
            needle.x2 = dir.x + offsetX;
            needle.y2 = -dir.y + offsetY;
        }



        GameEngine.scene.onBeforeRenderObservable.add(() => {
            const rpmPercentage = GameEngine.car.engine.engineTorque * 100 / GameEngine.car.engine.maxRpm
            console.log(rpmPercentage)
            const angle = 90 - (rpmPercentage / 100 * 180)
            setNeedle(angle);
        });
    }



    update() {
        if (GameEngine.stage.state === RunState.RUNNING) {
            const now = performance.now();
            const elapsed = now - this.startTime; // in milliseconds

            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const milliseconds = Math.floor(elapsed % 1000);

            this.gameTimerText.text =
                (minutes < 10 ? "0" : "") + minutes + ":" +
                (seconds < 10 ? "0" : "") + seconds + "." +
                milliseconds.toString().padStart(3, '0');
        }
    }

}