import * as BABYLON from "@babylonjs/core";
import GameEngine from "../GameEngine.ts";
import {Quaternion, Vector3} from "@babylonjs/core";

export default class CameraManager {
    gameCamera: BABYLON.UniversalCamera;
    private flyCamera: BABYLON.FlyCamera;

    constructor() {
        this.gameCamera = new BABYLON.UniversalCamera("gamecamera", new BABYLON.Vector3(10, 2, 0), GameEngine.scene);
        this.gameCamera.rotation.y -= Math.PI / 2
        this.gameCamera.rotation.x += 0.1

        this.flyCamera = new BABYLON.FlyCamera("flycamera", new BABYLON.Vector3(10, 2, 0), GameEngine.scene)
        this.flyCamera.keysForward = [90]
        this.flyCamera.keysBackward = [83]
        this.flyCamera.keysUp = [32]
        this.flyCamera.keysDown = [16]
        this.flyCamera.keysLeft = [81]
        this.flyCamera.keysRight = [68]
        this.flyCamera.rollCorrect = 2

        window.addEventListener("keydown", (e) => {
            if (e.key === 'c') {
                GameEngine.scene.activeCamera?.detachControl()
                GameEngine.scene.activeCamera = GameEngine.scene.activeCamera === this.gameCamera ? this.flyCamera : this.gameCamera
                if (GameEngine.scene.activeCamera !== this.gameCamera) GameEngine.scene.activeCamera.attachControl()
            }
        });

        window.addEventListener("click", () => {
            if (GameEngine.scene.activeCamera === this.flyCamera) {
                GameEngine.canvas.requestPointerLock()

                var hit = GameEngine.scene.pick(GameEngine.scene.pointerX, GameEngine.scene.pointerY);
                console.log(hit)
            }
        });

        GameEngine.eventManager.onRunEnd.add(() => {

        })
    }

    update() {
        let cameraLerpSpeed = 0.1; // Adjust for faster/slower follow effect
        const cameraDistanceFromCar = -7;
        const cameraDistanceOffset = new Vector3(
            0,
            1.5,
            0
        );

        if (GameEngine.scene.activeCamera === this.gameCamera) {
            this.flyCamera.position.copyFrom(this.gameCamera.position)

            const forward = GameEngine.car.getDirection();

            const yawAmount = GameEngine.inputManager.keys.freeView.x;
            const pitchAmount = GameEngine.inputManager.keys.freeView.y;
            if (Math.abs(yawAmount) > 0.1  || Math.abs(pitchAmount) > 0.1) {
                cameraLerpSpeed = .5
            } else {
                cameraLerpSpeed = 0.2;
            }

            const yawRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, yawAmount * 2);

            const rotationMatrix = new BABYLON.Matrix();
            yawRotation.toRotationMatrix(rotationMatrix);
            const rotatedForward = BABYLON.Vector3.TransformCoordinates(forward, rotationMatrix).normalize();

            const finalOffset = rotatedForward
                .scale(cameraDistanceFromCar)
                .add(cameraDistanceOffset);
            finalOffset.y += pitchAmount * 2;

            const targetPosition = GameEngine.car.chassisMesh.position.add(finalOffset);
            GameEngine.scene.activeCamera.position = BABYLON.Vector3.Lerp(GameEngine.scene.activeCamera.position, targetPosition, cameraLerpSpeed);

            const lookAtTarget = BABYLON.Vector3.Lerp(GameEngine.scene.activeCamera.getTarget(), GameEngine.car.chassisMesh.position, cameraLerpSpeed);
            GameEngine.scene.activeCamera.setTarget(lookAtTarget);
        }
    }

}