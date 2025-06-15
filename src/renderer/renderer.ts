import './index.scss'

import "@milkdown/theme-nord/style.css"
import { electronAPI } from '../shared/constants/electronAPI'

import registerLoadHandlers from './handlers/loadHandlers'
import registerMenuHandlers from './handlers/menuHandlers'
import registerWindowsHandlers from './handlers/windowsHandlers'

window.addEventListener('DOMContentLoaded', () => {
    registerWindowsHandlers()
    registerMenuHandlers()
    
    registerLoadHandlers()
    window[electronAPI.channel].loadedRenderer()
})