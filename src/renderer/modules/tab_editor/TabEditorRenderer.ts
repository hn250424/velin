import { Editor, editorViewCtx, parserCtx, rootCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"
import { redo, undo } from 'prosemirror-history'
import { injectable } from "inversify"
import {
    CLASS_TAB,
    DATASET_ATTR_TAB_ID,
    MODIFIED_TEXT,
    CLASS_EDITOR_BOX,
    NOT_MODIFIED_TEXT,
    CLASS_TAB_GHOST
} from '../../constants/dom'
import TabEditorView from "./TabEditorView"
import TabViewModel from "src/renderer/viewmodels/TabViewModel"

@injectable()
export default class TabEditorRenderer {
    private _tabEditorViews: TabEditorView[] = []
    private _pathToTabEditorViewMap: Map<string, TabEditorView> = new Map()

    private ghostTab: HTMLElement | null
    private indicator: HTMLElement | null

    private tabContainer: HTMLElement
    private editorContainer: HTMLElement

    constructor() {
        this.tabContainer = document.getElementById('tab_container')
        this.editorContainer = document.getElementById('editor_container')
    }

    private createTabBox(fileName: string) {
        const div = document.createElement('div')
        div.classList.add(CLASS_TAB)

        const span = document.createElement('span')
        span.textContent = fileName ? fileName : "Untitled"

        const button = document.createElement('button')
        button.textContent = NOT_MODIFIED_TEXT

        div.appendChild(span)
        div.appendChild(button)

        return { div, span, button }
    }

    async createTabAndEditor(viewModel: TabViewModel, content: string) {
        const { id, isModified, filePath, fileName } = viewModel

        const { div, span, button } = this.createTabBox(fileName)
        div.dataset[DATASET_ATTR_TAB_ID] = id.toString()
        span.title = filePath || ''
        this.tabContainer.appendChild(div)

        const editorBoxDiv = document.createElement('div')
        editorBoxDiv.className = CLASS_EDITOR_BOX
        const editor = await Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, editorBoxDiv)
                nord(ctx)
            })
            .use(commonmark)
            .use(history)
            .create()
        editor.action(ctx => {
            const parser = ctx.get(parserCtx)
            const view = ctx.get(editorViewCtx)
            const doc = parser(content)

            view.dispatch(
                view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content)
            )
        })
        editorBoxDiv.setAttribute('spellcheck', 'false')
        this.editorContainer.appendChild(editorBoxDiv)

        const tabEditorView = new TabEditorView(div, span, button, editorBoxDiv, editor)
        tabEditorView.observeEditor(
            () => {
                if (!viewModel.isModified) {
                    viewModel.isModified = true
                    tabEditorView.setTabButtonTextContent(MODIFIED_TEXT)
                }
            },
            () => {
                if (!viewModel.filePath && viewModel.isModified) {
                    const firstLine = tabEditorView.getEditorFirstLine()
                    tabEditorView.setTabSpanTextContent(firstLine || 'Untitled')
                }
            }
        )
        this._tabEditorViews.push(tabEditorView)
        this.setTabEditorViewByPath(filePath, tabEditorView)
    }

    removeTabAndEditor(index: number) {
        this._tabEditorViews[index].destroy()
        this._tabEditorViews.splice(index, 1)
    }



    get tabEditorViews(): readonly TabEditorView[] {
        return this._tabEditorViews
    }

    getTabEditorViewByIndex(index: number) {
        return this._tabEditorViews[index]
    }

    getTabEditorViewIndexById(id: number) {
        return this._tabEditorViews.findIndex(v => v.getId() === id)
    }

    get pathToTabEditorViewMap(): ReadonlyMap<string, TabEditorView> {
        return this._pathToTabEditorViewMap
    }

    deleteTabEditorViewByPath(path: string) {
        this._pathToTabEditorViewMap.delete(path)
    }

    getTabEditorViewByPath(path: string) {
        return this._pathToTabEditorViewMap.get(path)
    }

    setTabEditorViewByPath(path: string, tabEditorVeiw: TabEditorView) {
        this._pathToTabEditorViewMap.set(path, tabEditorVeiw)
    }



    undo(index: number) {
        this._tabEditorViews[index].editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            const { state, dispatch } = view
            undo(state, dispatch)
        })
    }

    redo(index: number) {
        this._tabEditorViews[index].editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            const { state, dispatch } = view
            redo(state, dispatch)
        })
    }

    paste(index: number, text: string) {
        this._tabEditorViews[index].editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            const { state, dispatch } = view
            view.focus()
            dispatch(state.tr.insertText(text))
        })
    }



    activateTabEditorByIndex(targetIndex: number, preActiveindex: number) {
        this._tabEditorViews[preActiveindex].setDeactive()
        this._tabEditorViews[targetIndex].setActive()
    }

    moveTabEditorView(fromIndex: number, toIndex: number) {
        const view = this._tabEditorViews.splice(fromIndex, 1)[0]
        this._tabEditorViews.splice(toIndex, 0, view)

        this.tabContainer.removeChild(view.tabDiv)
        const refNode = this.tabContainer.children[toIndex] ?? null
        this.tabContainer.insertBefore(view.tabDiv, refNode)
    }



    createGhostBox(fileName: string) {
        if (this.ghostTab) return this.ghostTab

        const { div, span, button } = this.createTabBox(fileName)
        div.classList.add(CLASS_TAB_GHOST)

        this.ghostTab = div
        document.body.appendChild(this.ghostTab)

        return div
    }

    removeGhostBox() {
        if (this.ghostTab) {
            this.ghostTab.remove()
            this.ghostTab = null
        }
    }

    createIndicator() {
        if (this.indicator) return this.indicator

        const _indicator = document.createElement('div')
        _indicator.className = 'tab-indicator'

        this.indicator = _indicator
        return this.indicator
    }

    removeIndicator() {
        if (this.indicator) {
            this.indicator.remove()
            this.indicator = null
        }
    }
}