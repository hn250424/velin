import { Editor, editorViewCtx, parserCtx, serializerCtx } from "@milkdown/kit/core"

import { Mode } from '../Shared/constants/Mode'
import { electronAPI } from '../Shared/constants/electronAPI'

export default function registerRendererHandler(editorInstance: Editor) {
    window[electronAPI.channel].onCreate(() => {
        editorInstance.action(ctx => {
            const view = ctx.get(editorViewCtx)
            const tr = view.state.tr.delete(0, view.state.doc.content.size)
            view.dispatch(tr)
        })
    })
    
    window[electronAPI.channel].onSave((isSaveAs: Boolean) => {
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

    window[electronAPI.channel].onSetMode((mode: number) => {
        editorInstance.action((ctx) => {
            const view = ctx.get(editorViewCtx)

            if (mode === Mode.Edit) {
                view.setProps({ editable: () => true })
            } else if (mode === Mode.Reading) {
                view.setProps({ editable: () => false })
            }
        })
    })
}
