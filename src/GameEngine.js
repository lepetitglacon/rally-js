import Three from "./game/engine/Three.js";
import Cannon from "./game/engine/Cannon.js";
import Ui from "./game/ui/Ui.js";
import StageFactory from "./game/stage/StageFactory.js";
import CarFactory from "./game/car/CarFactory.js";

export default class GameEngine extends EventTarget{

    constructor() {
        super()
        this.ui = new Ui({engine: this})
        this.three = new Three({engine: this})
        this.cannon = new Cannon({engine: this})
        this.stageFactory = new StageFactory({engine: this})
        this.carFactory = new CarFactory({engine: this})

        this.bind()
        this.init()
    }

    bind() {
        this.addEventListener('user-input/start-game', e => {
            console.log('GAME-ENGINE - user started the race', e.detail.stage, e.detail.car)
            this.ui.remove()
            this.startGame(e.detail)
        })
    }

    init() {
        this.ui.init()
        console.log('game initialized')
    }

    async startGame({stage, car}) {
        this.three.init()
        this.cannon.init()

        this.stage = await this.stageFactory.getStage(stage)
        this.stage.addToWorld(this.three.scene, this.cannon.world)


        this.car = this.carFactory.getCar(car)


    }
}