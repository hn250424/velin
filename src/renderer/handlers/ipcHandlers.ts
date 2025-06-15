import { Editor, editorViewCtx, parserCtx, serializerCtx } from "@milkdown/kit/core"

import { electronAPI } from '../../shared/constants/electronAPI'

export default function registerIpcHandlers(editorInstance: Editor) {
    window[electronAPI.channel].onCreate(() => {
        editorInstance.action(ctx => {
            const view = ctx.get(editorViewCtx)
            const tr = view.state.tr.delete(0, view.state.doc.content.size)
            view.dispatch(tr)
        })
    })
    
    window[electronAPI.channel].onSave((isSaveAs: boolean) => {
        editorInstance.action(ctx => {
            const serializer = ctx.get(serializerCtx)
            const view = ctx.get(editorViewCtx)
            const doc = view.state.doc
            const md = serializer(doc)

            window[electronAPI.channel].sendSave(md, isSaveAs)
        })
    })

    window[electronAPI.channel].onOpen((content: string) => {
        editorInstance.action(ctx => {
            const parser = ctx.get(parserCtx)
            const doc = parser(content)

            const view = ctx.get(editorViewCtx)
            view.dispatch(
                view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content)
            )
        })
    })
}