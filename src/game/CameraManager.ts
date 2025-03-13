import * as BABYLON from "@babylonjs/core";

export default class CameraManager {
    private gameCamera: BABYLON.UniversalCamera;
    private flyCamera: BABYLON.FlyCamera;

    constructor() {
        this.gameCamera = new BABYLON.UniversalCamera("gamecamera", new BABYLON.Vector3(10, 2, 0), scene);
        this.gameCamera.rotation.y -= Math.PI / 2
        this.gameCamera.rotation.x += 0.1

        this.flyCamera = new BABYLON.FlyCamera("flycamera", new BABYLON.Vector3(10, 2, 0), scene)
        this.flyCamera.keysForward = [90]
        this.flyCamera.keysBackward = [83]
        this.flyCamera.keysUp = [32]
        this.flyCamera.keysDown = [16]
        this.flyCamera.keysLeft = [81]
        this.flyCamera.keysRight = [68]
        this.flyCamera.rollCorrect = 2

        window.addEventListener("keydown", (e) => {
            if (e.key === 'c') {
                scene.activeCamera?.detachControl()
                scene.activeCamera = scene.activeCamera === this.gameCamera ? this.flyCamera : this.gameCamera
                scene.activeCamera.attachControl()
            }
        });

        window.addEventListener("click", () => {
            if (scene.activeCamera === this.flyCamera) {
                canvas.requestPointerLock()
            }
        });
    }

    update() {
        const cameraLerpSpeed = 0.1; // Adjust for faster/slower follow effect

        if (scene.activeCamera === gameCamera) {
            flyCamera.position.copyFrom(gameCamera.position)
            const forward = getVehicleForwardDirection(chassisBody);
            const cameraOffset = forward.scale(-6).add(new BABYLON.Vector3(0, 2, 0));
            const targetPosition = chassisMesh.position.add(cameraOffset);
            scene.activeCamera.position = BABYLON.Vector3.Lerp(scene.activeCamera.position, targetPosition, cameraLerpSpeed);
            const lookAtTarget = BABYLON.Vector3.Lerp(scene.activeCamera.getTarget(), chassisMesh.position.add(forward.scale(5)), cameraLerpSpeed);
            scene.activeCamera.setTarget(lookAtTarget);
        }
    }

}