import {Observable} from "@babylonjs/core";

export default class EventManager {
    public onCarInitialized: Observable;
    public onUserHandBreakForTheFirstTime: Observable;
    public onRunStart: Observable;
    public onRunEnd: Observable;

    constructor() {
        this.onCarInitialized = new Observable();
        this.onUserHandBreakForTheFirstTime = new Observable();
        this.onRunStart = new Observable();
        this.onRunEnd = new Observable();


        this.onUserHandBreakForTheFirstTime.add(() => {

        })
        this.onRunStart.add(() => {

        })
    }
}