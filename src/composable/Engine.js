export default class Engine {
    constructor({horsepower, maxRPM, gearRatios}) {
        this.horsepower = horsepower;
        this.isRunning = true; // TODO

        this.maxRPM = maxRPM;
        this.idleRPM = 1000;

        this.currentRPM = this.idleRPM;
        this.currentTorque = 0
        this.currentMotorForce = 0


        this.dampingFactor = 0.99
        this.currentGear = 0;
        this.gearRatios = gearRatios; // Array of gear ratios
        this.torqueCurve = [ // https://www.automobile-catalog.com/curve/1999/2613065/peugeot_306_gti-6.html#gsc.tab=0
            {rpm: 500, torque: 50},
            {rpm: 1000, torque: 80},
            {rpm: 1500, torque: 125},
            {rpm: 2000, torque: 150},
            {rpm: 2500, torque: 160},
            {rpm: 3000, torque: 175},
            {rpm: 3500, torque: 180},
            {rpm: 4000, torque: 182},
            {rpm: 4500, torque: 185},
            {rpm: 5000, torque: 187},
            {rpm: 5500, torque: 190},
            {rpm: 6000, torque: 182},
            {rpm: 6500, torque: 175},
            {rpm: 7000, torque: 150},
            {rpm: 7500, torque: 150},
            {rpm: 8000, torque: 150},
            {rpm: 8500, torque: 150},
        ];
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            console.log("Engine started!");
        } else {
            console.log("Engine already running!");
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            this.currentRPM = 0;
            this.currentGear = 0;
            console.log("Engine stopped!");
        } else {
            console.log("Engine already stopped!");
        }
    }

    shiftGear(gear) {
        if (!this.isRunning) {
            console.log("Engine is not running, cannot shift gears!");
            return;
        }
        // Enforce valid gear selection within gear ratios length
        if (this.currentGear !== gear) {
            console.log(`Gear shifted to: ${gear}`);
        }
        this.currentGear = gear
    }

    throttleToRPM(throttle) {
        if (!throttle) {
            if (this.currentRPM > this.idleRPM) {
                return this.currentRPM - this.currentRPM * this.dampingFactor;
            }
            return this.idleRPM
        } else {
            return Math.max(
                Math.min(
                    throttle/100 * this.maxRPM * this.gearRatios[this.currentGear],
                    this.maxRPM
                ),
                this.idleRPM
            );
        }
    }

    getTorqueFromCurve() {
        // Input validation (optional)
        if (!Array.isArray(this.torqueCurve) || this.torqueCurve.length < 2) {
            console.error("Invalid torqueCurve data!");
            return 0;
        }

        if (this.currentGear === 0) {
            return 0
        }

        // Find the two data points in the curve that bracket the given RPM
        let lowerIndex = 0;
        let upperIndex = this.torqueCurve.length - 1;

        for (let i = 0; i < this.torqueCurve.length; i++) {
            if (this.currentRPM <= this.torqueCurve[i].rpm) {
                upperIndex = i;
                break;
            }
        }

        lowerIndex = Math.max(upperIndex - 1, 0); // Ensure lowerIndex is within bounds

        // Perform linear interpolation between the two data points
        const lowerRPM = this.torqueCurve[lowerIndex].rpm;
        const lowerTorque = this.torqueCurve[lowerIndex].torque;
        const upperRPM = this.torqueCurve[upperIndex].rpm;
        const upperTorque = this.torqueCurve[upperIndex].torque;

        const rpmFraction = (this.currentRPM - lowerRPM) / (upperRPM - lowerRPM);
        const interpolatedTorque = lowerTorque + rpmFraction * (upperTorque - lowerTorque);

        return interpolatedTorque;
    }

    update(throttle) {
        if (!this.isRunning) {
            return;
        }

        this.currentRPM = this.throttleToRPM(throttle)

        this.currentTorque = this.getTorqueFromCurve()
        this.currentMotorForce = this.currentTorque * this.gearRatios[this.currentGear]
    }
}