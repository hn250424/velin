import './index.scss'

import "@milkdown/theme-nord/style.css"
import { electronAPI } from '../shared/constants/electronAPI'

import registerLoadHandlers from './handlers/loadHandlers'
import registerMenuHandlers from './handlers/menuHandlers'
import registerWindowHandlers from './handlers/windowHandlers'

window.addEventListener('DOMContentLoaded', () => {
    registerWindowHandlers()
    registerMenuHandlers()
    
    registerLoadHandlers()
    window[electronAPI.channel].loadedRenderer()

    document.getElementById('addTabButton').addEventListener('click', async () => {
        const res = await window[electronAPI.channel].confirm('test test')
        console.log(res)
    })
})