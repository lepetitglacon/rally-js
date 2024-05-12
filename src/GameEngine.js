import * as THREE from 'three';
import Three from "./game/engine/Three.js";
import Cannon from "./game/engine/Cannon.js";
import Ui from "./game/ui/Ui.js";

export default class GameEngine extends EventTarget{

    constructor() {
        super()
        this.ui = new Ui({engine: this})
        this.three = new Three({engine: this})
        this.cannon = new Cannon({engine: this})

        this.bind()
        this.init()
    }

    init() {
        this.ui.init()
        console.log('game initialized')
    }

    bind() {
        this.addEventListener('user-input/start-game', e => {
            console.log('GAME-ENGINE - user started the race', e.detail.stage, e.detail.car)
        })
    }
}