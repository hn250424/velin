import './index.scss'

import { Editor, rootCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"

import { Mode } from '../Shared/constants/Mode'

window.addEventListener('DOMContentLoaded', () => {
    window.electronAPI.onSetMode((mode: number) => {
        if (mode === Mode.Edit) {
            alert('edit')
        } else if (mode === Mode.Reading) {
            alert('reading')
        }
    })
})

const container = document.getElementById('container')

Editor.make()
    .config((ctx) => {
        ctx.set(rootCtx, container)
        nord(ctx)
    })
    .use(commonmark)
    .use(history)
    .create()
    .then((editor) => {
        console.log("Editor created")

        // editor.destroy()
    })
