import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";

class InputConnectedKeyboard extends GUI.VirtualKeyboard {

    constructor() {
        super();
    }

    private _createKey(key, propertySet) {
        const button = super._createKey(key, propertySet)
        const f = (e) => {
            console.log(e)
            if (e.key === key) button.focus();
        }
        window.addEventListener("keydown", f)
        return button
    }

}

export default class Gui {
    private gui: GUI.AdvancedDynamicTexture;
    private infoPanel: GUI.StackPanel;
    private updateFunctions: Map<string, Function>;

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