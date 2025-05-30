import {type Mesh, Observable, type Vector3} from "@babylonjs/core";

export default class EventManager {

    // Engine
    public onControllerStartButton: Observable = new Observable();
    public onControllerHandbrakeButton: Observable = new Observable();
    public onControllerAButton: Observable = new Observable();
    public onControllerXButton: Observable = new Observable();

    // Car
    public onCarLoader: Observable = new Observable();
    public onCarInitialized: Observable = new Observable();
    public onCarEngineStart: Observable = new Observable();
    public onCarEngineStop: Observable = new Observable();
    public onUserHandBreakForTheFirstTime: Observable = new Observable();

    // Stage
    public onStageLoaded: Observable<{
        terrainMesh: Mesh,
        startMesh: Mesh,
        endMesh: Mesh,
        checkpoints: Vector3[],
    }> = new Observable();
    public onNextWaypoint: Observable<{
        index: number
        waypoint: Vector3
        distance: number
        totalDistanceBetweenPoints: number
    }> = new Observable();



    // Run
    public onRunStart: Observable = new Observable();
    public onRunEnd: Observable = new Observable();

    constructor() {}
}