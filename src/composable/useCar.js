import {Car} from "./Car/Car.js";
import CarFactory from "./Car/CarFactory.js";

const carFactory = new CarFactory({})
const car = carFactory.getCar()

export function useCar() {
    return {car: car}
}

