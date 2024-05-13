import Car from "./Car.js";

export default class CarFactory {

    constructor({engine}) {
        this.engine = engine;
    }

    getCar(carName, options = {}) {
        const car = new Car({
            engine: this.engine,
        });
        return car
    }

}