import {Car} from "./Car.js";

export default class CarFactory {

    static PHYSICS_TYPE = {
        CONSTRAINT: 'constraint',
        RAYCAST: 'raycast'
    }

    constructor({config}) {
        this.config = config
        this.idCounter = 0
    }

    getCar(config = {}) {
        const car = new Car()
        car.id = this.idCounter++

        if (config?.type === CarFactory.PHYSICS_TYPE.CONSTRAINT) {

        } else {

        }


        console.log('created car ' + this.idCounter)
        return car
    }



}