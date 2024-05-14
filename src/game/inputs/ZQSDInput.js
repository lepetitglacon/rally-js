export default class ZQSDInput {

    constructor({engine}) {
        this.engine = engine

        this.z = false
        this.q = false
        this.s = false
        this.d = false
        this.space = false
    }

    init() {
        this.bind()
        this.engine.ui.debugInfos.zqsd = this
    }

    bind() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'z':
                case 'ArrowUp':
                    this.z = true
                    break
                case 's':
                case 'ArrowDown':
                    this.s = true
                    break
                case 'q':
                case 'ArrowLeft':
                    this.q = true
                    break
                case 'd':
                case 'ArrowRight':
                    this.d = true
                    break
                case ' ':
                    this.space = true
                    break
            }
        })

        // Reset force on keyup
        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'z':
                case 'ArrowUp':
                    this.z = false
                    break
                case 's':
                case 'ArrowDown':
                    this.s = false
                    break
                case 'q':
                case 'ArrowLeft':
                    this.q = false
                    break
                case 'd':
                case 'ArrowRight':
                    this.d = false
                    break
                case ' ':
                    this.space = false
                    break
            }
        })
    }

    toString() {
        return JSON.stringify({
            z: this.z,
            q: this.q,
            s: this.s,
            d: this.d,
            space: this.space,
        })
    }
}