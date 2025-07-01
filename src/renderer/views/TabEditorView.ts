import { serializerCtx } from '@milkdown/core'
import { Editor, editorViewCtx, parserCtx } from "@milkdown/kit/core"
import "@milkdown/theme-nord/style.css"
import { DATASET_ATTR_TAB_ID } from '../constants/dom'

export default class TabEditorView {
    private _editor: Editor
    private _tabDiv: HTMLElement
    private _tabSpan: HTMLElement
    private _tabButton: HTMLElement
    private _editorBoxDiv: HTMLElement

    constructor(
        tabDiv: HTMLElement,
        tabSpan: HTMLElement,
        tabButton: HTMLElement,
        editorBoxDiv: HTMLElement,
        editor: Editor
    ) {
        this._tabDiv = tabDiv
        this._tabSpan = tabSpan
        this._tabButton = tabButton
        this._editorBoxDiv = editorBoxDiv
        this._editor = editor
    }

    getViewId(): number {
        return parseInt(this.tabDiv.dataset[DATASET_ATTR_TAB_ID], 10)
    }

    observeEditor(onInput: () => void, onBlur: () => void) {
        this.editor.action(ctx => {
            const view = ctx.get(editorViewCtx)
            view.setProps({
                handleDOMEvents: {
                    input: () => {
                        onInput()
                        return false
                    },
                    blur: () => {
                        onBlur()
                        return false
                    }
                }
            })
        })
    }

    getEditorFirstLine() {
        const editorView = this.editor.ctx.get(editorViewCtx)
        const firstLine = editorView.state.doc
            .textBetween(0, editorView.state.doc.content.size)
            .split('\n')[0]
            .trim()

        return firstLine || 'Untitled'
    }

    getContent(): string {
        let content = ''
        this.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            const serializer = ctx.get(serializerCtx)
            content = serializer(view.state.doc)
        })
        return content
    }

    setContent(content: string): void {
        this.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            const parser = ctx.get(parserCtx)
            const doc = parser(content)

            if (doc) {
                const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content)
                view.dispatch(tr)
            }
        })
    }

    destroyTabDiv() {
        this.tabDiv.remove()
    }

    destroyEditorBoxDiv() {
        this.editorBoxDiv.remove()
    }

    setActive() {
        this.editorBoxDiv.style.display = 'block'
        this.tabDiv.style.background = 'red'
    }

    setDeactive() {
        this.editorBoxDiv.style.display = 'none'
        this.tabDiv.style.background = 'grey'
    }

    setTabSpanTextContent(text: string) {
        this._tabSpan.textContent = text
    }

    setTabButtonTextContent(text: string) {
        this._tabButton.textContent = text
    }

    get editor(): Editor {
        return this._editor
    }

    get tabDiv(): HTMLElement {
        return this._tabDiv
    }

    get tabSpan() {
        return this._tabSpan
    }

    get tabButton() {
        return this._tabButton
    }

    get editorBoxDiv() {
        return this._editorBoxDiv
    }
}