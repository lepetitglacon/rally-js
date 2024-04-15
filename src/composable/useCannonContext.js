import * as CANNON from "cannon-es";

const world = new CANNON.World()
world.gravity.set(0, -10, 0)
world.solver.iterations = 10

export function useCannonContext() {
    return {
        world: world,
    }
}
