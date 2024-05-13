import menu from '../../assets/html/menu.html?raw'
import playMenuTemplate from '../../assets/html/menu/play.html?raw'
import defaultLoader from '../../assets/html/loader/default.html?raw'

import '../../assets/css/menu.css'
import '../../assets/css/loader.css'

export default class Ui {

    constructor({engine}) {
        this.engine = engine

        this.menuTemplates = {
            'play': playMenuTemplate
        }
        this.loaderTemplates = {
            0: defaultLoader
        }
    }

    init() {

        this.rootDiv = document.getElementById('app')
        this.menu = document.createElement('div')
        this.innerMenu = document.createElement('div')
        this.gameDiv = document.createElement('div')
        this.loadingDiv = document.createElement('div')

        this.loadingDiv.innerHTML = this.loaderTemplates[0]
        this.hideLoader()

        this.menu.innerHTML = menu



        this.rootDiv.style.background = '#663377'
        this.rootDiv.style.width = '100vw'
        this.rootDiv.style.height = '100vh'
        this.rootDiv.style.display = 'flex'

        this.rootDiv.appendChild(this.menu)
        this.rootDiv.appendChild(this.innerMenu)
        this.rootDiv.appendChild(this.loadingDiv)
        this.parseTemplateButtons()
    }

    parseTemplateButtons(element = 'menu', classname = 'menu-button') {
        const buttons = this[element].getElementsByClassName(classname)
        console.log('loaded buttons', buttons)
        for (const button of buttons) {
            button.addEventListener('click', () => {
                this.handleTemplateButtonAction(button.dataset.action)
            })
        }
    }

    handleTemplateButtonAction(templateAction) {
        console.log(templateAction)
        switch (templateAction) {
            case 'start':
                this.engine.dispatchEvent(
                    new CustomEvent('user-input/start-game',
                        {
                            detail: {
                                stage: this.selectedStage ?? 'france-besancon-bregille',
                                car: this.selectedCar ?? 'clio 3'
                            }
                        })
                )
                break;
            default:
                this.innerMenu.innerHTML = this.menuTemplates[templateAction]
                this.parseTemplateButtons('innerMenu', 'start-game-button')
        }
    }

    showLoader() {
        this.loadingDiv.style.display = 'block'
    }
    hideLoader() {
        this.loadingDiv.style.display = 'none'
    }

    showMenu() {
        this.menu.innerHTML = ''
        this.innerMenu.innerHTML = ''
    }
    hideMenu() {
        this.menu.innerHTML = ''
        this.innerMenu.innerHTML = ''
    }

    bind() {
        this.engine.addEventListener('', e => {

        })
    }
}