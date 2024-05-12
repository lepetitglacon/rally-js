import menu from '../../assets/html/menu.html?raw'
import playMenuTemplate from '../../assets/html/menu/play.html?raw'

import '../../assets/css/menu.css'

export default class Ui {

    constructor({engine}) {
        this.engine = engine
        this.htmlLoader = ''
    }

    init() {
        this.rootDiv = document.getElementById('app')

        this.menu = document.createElement('div')
        this.menu.innerHTML = menu

        this.innerMenu = document.createElement('div')

        this.menuTemplates = {
            'play': playMenuTemplate
        }

        this.rootDiv.style.background = '#663377'
        this.rootDiv.style.width = '100vw'
        this.rootDiv.style.height = '100vh'
        this.rootDiv.style.display = 'flex'

        this.rootDiv.appendChild(this.menu)
        this.rootDiv.appendChild(this.innerMenu)
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
                                stage: this.selectedStage,
                                car: this.selectedCar
                            }
                        })
                )
                break;
            default:
                this.innerMenu.innerHTML = this.menuTemplates[templateAction]
                this.parseTemplateButtons('innerMenu', 'start-game-button')

        }

    }

    bind() {

    }
}