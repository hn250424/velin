import './index.scss'

import "@milkdown/theme-nord/style.css"
import { electronAPI } from '../shared/constants/electronAPI'

import registerFileHandlers from './handlers/fileHandlers'
import registerLoadHandlers from './handlers/loadHandlers'
import registerWindowHandlers from './handlers/windowHandlers'

let contextMenu: HTMLElement
let menuBar: HTMLElement
let menuItems: NodeListOf<HTMLElement>
let titleBar: HTMLElement

window.addEventListener('DOMContentLoaded', () => {
    contextMenu = document.getElementById('tab_context_menu')
    menuBar = document.getElementById('#menu_bar')
    menuItems = document.querySelectorAll('#menu_bar .menu_item')
    titleBar = document.getElementById('title_bar')

    registerWindowHandlers()
    registerFileHandlers()
    registerLoadHandlers()

    bindMenuBarEvents()
    bindDocumentClickEvents()
    bindDocumentContextMenuEvents()

    window[electronAPI.channel].loadedRenderer()
})

function bindDocumentContextMenuEvents() {
    document.addEventListener('contextmenu', (e) => {
        const tab = (e.target as HTMLElement).closest('.tab') as HTMLElement

        if (!tab) {
            contextMenu.style.display = 'none'
        } else {
            e.preventDefault()
            contextMenu.style.display = 'flex'
            contextMenu.style.left = `${e.clientX}px`
            contextMenu.style.top = `${e.clientY}px`
        }
    })
}

function bindDocumentClickEvents() {
    document.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'))
        contextMenu.style.display = 'none'
    })
}

function bindMenuBarEvents() {
    menuItems.forEach(item => {
        item.addEventListener('click', e => {
            e.stopPropagation()

            menuItems.forEach(i => {
                if (i !== item) i.classList.remove('active')
            })

            item.classList.toggle('active')

            if (contextMenu.style.display === 'flex') {
                contextMenu.style.display = 'none'
            }
        })

        item.addEventListener('mouseenter', () => {
            const anyActive = Array.from(menuItems).some(i => i.classList.contains('active'))
            if (anyActive) {
                menuItems.forEach(i => i.classList.remove('active'))
                item.classList.add('active')
            }
        })
    })

    titleBar.addEventListener('mousedown', () => {
        menuItems.forEach(item => item.classList.remove('active'))
    })
}