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

            this.startGame(e.detail)
        })
    }

    init() {
        this.ui.init()
        console.log('game initialized')
    }

    async startGame({stage, car}) {
        this.ui.showLoader()
        this.three.init()
        this.cannon.init()

        // load stage
        this.stage = await this.stageFactory.getStage(stage)
        this.stage.addToWorld(this.three.scene, this.cannon.world)

        // load car
        this.car = this.carFactory.getCar(car)
        this.car.addToWorld(this.three.scene, this.cannon.world)
        this.car.body.position.copy(this.stage.startingPoints[0])

        // change UI
        this.ui.hideMenu()
        this.ui.hideLoader()
        this.ui.gameDiv.appendChild( this.three.renderer.domElement );
        this.ui.rootDiv.appendChild(this.ui.gameDiv);
    }
}