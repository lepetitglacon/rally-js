import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import GameEngine from "./GameEngine.ts";
import {RunState} from "./Stage.ts";
import {TextBlock} from "@babylonjs/gui";

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

    update() {
        if (GameEngine.map.state === RunState.RUNNING) {
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

}