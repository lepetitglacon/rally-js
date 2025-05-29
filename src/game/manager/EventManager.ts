import {Observable} from "@babylonjs/core";

export default class EventManager {

    // Engine
    public onControllerStartButton: Observable;

    // Car
    public onCarLoader: Observable;
    public onCarInitialized: Observable;
    public onCarEngineStart: Observable;
    public onCarEngineStop: Observable;
    public onUserHandBreakForTheFirstTime: Observable;

    // Run
    public onRunStart: Observable;
    public onRunEnd: Observable;

    constructor() {

        this.onControllerStartButton = new Observable();

        this.onCarLoader = new Observable();
        this.onCarInitialized = new Observable();
        this.onCarEngineStart = new Observable();
        this.onCarEngineStop = new Observable();
        this.onUserHandBreakForTheFirstTime = new Observable();

        this.onRunStart = new Observable();
        this.onRunEnd = new Observable();


        this.onUserHandBreakForTheFirstTime.add(() => {

        })
        this.onRunStart.add(() => {

        })
    }
}