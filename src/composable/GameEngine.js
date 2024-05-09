export default class GameEngine extends EventTarget{

    constructor() {
        super()
        this.running = false
        this.runTimer = 0

        this.countdownTimeInSec = 5

        this.bind()
    }

    bind() {
        window.addEventListener('keypress', e => {
            if (e.key === 'escape') {

            }
        })

        this.addEventListener('runinit/car/inposition', e => {
            console.log('car is in position, starting countdown')
            this.dispatchEvent(new CustomEvent('vue/gameEngine/countdown-start', {
                detail: this.countdownTimeInSec
            }))
            let currentCountdown = this.countdownTimeInSec
            const i = setInterval((e) => {
                currentCountdown--
                if (currentCountdown <= 0) {
                    currentCountdown = 'GO'
                }
                console.log(currentCountdown)
                this.dispatchEvent(new CustomEvent('vue/gameEngine/countdown-change', {
                    detail: currentCountdown
                }))
                if (currentCountdown === 'GO') {
                    clearInterval(i)
                    this.running = true
                }
            }, 1000)
        })

        this.addEventListener('runinit/map/world/loaded', e => {
            console.log('cannon world loaded')
        })
    }
}