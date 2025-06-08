import './index.scss'

import { Editor, editorViewOptionsCtx, rootCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"

import registerRendererHandler from './rendererHandler'

let editorInstance: Editor | null = null

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container')

    Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, container)
            ctx.set(editorViewOptionsCtx, {
                editable: () => false
            })
            nord(ctx)
        })
        .use(commonmark)
        .use(history)
        .create()
        .then((editor) => {
            editorInstance = editor
            registerRendererHandler(editorInstance)
        })
})


