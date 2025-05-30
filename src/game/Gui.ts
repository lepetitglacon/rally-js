import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import GameEngine from "./GameEngine.ts";
import {RunState} from "./Stage.ts";
import {Rectangle, TextBlock} from "@babylonjs/gui";
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

    private currentWaypointIndex = 0;
    private numberOfWaypoints = 0;

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
        GameEngine.eventManager.onStageLoaded.add((e) => {
            this.createWaypoints(e.checkpoints)
        })
        GameEngine.eventManager.onNextWaypoint.add((e) => {
            this.currentWaypointIndex = e.index
            { // car waypoint
                const distPercentage = 100 - e.distance * 100 / e.totalDistanceBetweenPoints
                const percent = this.currentWaypointIndex / (this.numberOfWaypoints - 1);
                const percentage = percent * 100;
                let subPercentage = distPercentage / (this.numberOfWaypoints - 1)
                const finalTop = percentage + subPercentage;
                console.log(percent, percentage,distPercentage, finalTop)
                this.carMarker.top = -finalTop + "%";
            }
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

        const header = new GUI.TextBlock();
        header.text = "N";
        header.height = "100px";
        header.color = "white";
        header.paddingBottom = "50px";
        header.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        header.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        container.addControl(header)

        GameEngine.scene.onBeforeRenderObservable.add(() => {
            const rpmPercentage = GameEngine.car.engine.currentRpm * 100 / GameEngine.car.engine.maxRpm
            const angle = 90 - (rpmPercentage / 100 * 180)
            setNeedle(angle);

            header.text = GameEngine.car.engine.currentGear.toString()
        });
    }

    private carMarker: Rectangle;

    createWaypoints(waypoints: BABYLON.Vector3[]) {
        this.numberOfWaypoints = waypoints.length;

        const lineContainer = new GUI.Rectangle();
        lineContainer.widthInPixels = 100
        lineContainer.heightInPixels = 300
        lineContainer.thickness = 0;
        lineContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        lineContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        lineContainer.left = "20px";
        this.gui.addControl(lineContainer);

// Create the vertical line itself
        const verticalLine = new GUI.Line();
        verticalLine.lineWidth = 4;
        verticalLine.color = "white";
        verticalLine.x1 = lineContainer.widthInPixels / 2;
        verticalLine.y1 = 0;
        verticalLine.x2 = lineContainer.widthInPixels / 2;
        verticalLine.y2 = lineContainer.heightInPixels;
        verticalLine.paddingTop = "20px";
        verticalLine.paddingBottom = "20px";
        lineContainer.addControl(verticalLine);

        const waypointNodes = [];
        let i = 0
        for (const waypoint of waypoints) {
            const circle = new GUI.Ellipse();
            circle.width = "20px";
            circle.height = "20px";
            circle.color = "white";
            circle.thickness = 2;
            circle.background = "gray";
            circle.top = ((i / (this.numberOfWaypoints - 1)) * 100 - 50) + "%"; // evenly spaced
            circle.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            circle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            lineContainer.addControl(circle);
            waypointNodes.push(circle);
            i++
        }

// Car marker
        this.carMarker =  new GUI.Rectangle();
        this.carMarker.width = "25px";
        this.carMarker.height = "10px";
        this.carMarker.color = "yellow";
        this.carMarker.background = "yellow";
        this.carMarker.top = "50%";
        this.carMarker.thickness = 0;
        this.carMarker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.carMarker.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        lineContainer.addControl(this.carMarker);
    }

    update() {
        if (GameEngine.stage.state === RunState.RUNNING) {
            { // timer
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

}