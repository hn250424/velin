import './index.scss'

import { Editor, rootCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"
import { electronAPI } from '../Shared/constants/electronAPI'

import registerDomEventHandlers from './handlers/domEventHandlers'
import registerIpcHandlers from './handlers/ipcHandlers'

let editorInstance: Editor | null = null

window.addEventListener('DOMContentLoaded', () => {
    const editorContainer = document.getElementById('editor_container')

    Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, editorContainer)
            nord(ctx)
        })
        .use(commonmark)
        .use(history)
        .create()
        .then(editor => {
            editorInstance = editor
            registerIpcHandlers(editorInstance)
        })

    registerDomEventHandlers()
    
    document.getElementById('minimize').addEventListener('click', () => {
        window[electronAPI.channel].test()
    })
    document.getElementById('maximize').addEventListener('click', () => {
        // ipcRenderer.send('window-control', 'maximize')
    })
    document.getElementById('close').addEventListener('click', () => {
        // ipcRenderer.send('window-control', 'close')
    })
})

