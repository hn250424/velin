import { Editor, editorViewCtx, parserCtx, rootCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"
import TabEditorDto from '@shared/dto/TabEditorDto'
import { redo, undo } from 'prosemirror-history'
import TabViewModel from '../../viewmodels/TabViewModel'
import TabEditorView from '../../views/TabEditorView'
import { DATASET_ATTR_TAB_ID, NOT_MODIFIED_TEXT } from '../../constants/dom'
import { MODIFIED_TEXT } from "../../constants/dom"

export default class TabEditorManager {
    private static instance: TabEditorManager | null = null
    private tabEditorViews: TabEditorView[] = []
    private _activeTabId = -1
    private _activeTabIndex = -1
    private _contextTabId = -1

    private tabContainer: HTMLElement
    private editorContainer: HTMLElement

    private idToTabViewModelMap: Map<number, TabViewModel> = new Map()

    private constructor() {
        this.tabContainer = document.getElementById('tab_container')
        this.editorContainer = document.getElementById('editor_container')
    }

    static getInstance(): TabEditorManager {
        if (this.instance === null) {
            this.instance = new TabEditorManager()
        }

        return this.instance
    }

    async restoreTabs(tabs: TabEditorDto[]) {
        const lastIndex = tabs.length - 1
        for (let i = 0; i < lastIndex; i++) {
            await this.addTab(tabs[i].id, tabs[i].filePath, tabs[i].fileName, tabs[i].content, false)
        }

        await this.addTab(tabs[lastIndex].id, tabs[lastIndex].filePath, tabs[lastIndex].fileName, tabs[lastIndex].content, true)
    }

    async addTab(id: number = 0, filePath: string = '', fileName: string = '', content: string = '', activate: boolean = true) {
        const tabViewModel = new TabViewModel(id, false, filePath, fileName)
        this.setIdToTabViewModel(id, tabViewModel)

        const { tabDiv, tabSpan, tabButton } = this.createTabBox(fileName)
        tabDiv.dataset[DATASET_ATTR_TAB_ID] = id.toString()
        tabSpan.title = filePath || ''
        this.tabContainer.appendChild(tabDiv)

        const editorBoxDiv = document.createElement('div')
        editorBoxDiv.className = 'editorBox'
        editorBoxDiv.style.display = 'none'
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
        this.editorContainer.appendChild(editorBoxDiv)

        const tabEditorView = new TabEditorView(tabDiv, tabSpan, tabButton, editorBoxDiv, editor)
        tabEditorView.observeEditor(
            () => {
                if (!tabViewModel.isModified) {
                    tabViewModel.isModified = true
                    tabEditorView.setTabButtonTextContent(MODIFIED_TEXT)
                }
            },
            () => {
                if (!tabViewModel.filePath && tabViewModel.isModified) {
                    const firstLine = tabEditorView.getEditorFirstLine()
                    tabEditorView.setTabSpanTextContent(firstLine || 'Untitled')
                }
            }
        )
        this.tabEditorViews.push(tabEditorView)
        if (activate) {
            this.tabEditorViews[this.activeTabIndex]?.setDeactive()
            this.activeTabIndex = this.tabEditorViews.length - 1
            this.tabEditorViews[this.activeTabIndex].setActive()
            this.activeTabId = id
        }
    }

    getTabEditorData(view: TabEditorView): TabEditorDto {
        const id = view.getViewId()
        const viewModel = this.getIdToTabViewModel(id)

        return {
            id: viewModel.id,
            isModified: viewModel.isModified,
            filePath: viewModel.filePath,
            fileName: this.resolveFileName(view),
            content: view.getContent()
        }
    }

    getActiveTabEditorData(): TabEditorDto {
        const view = this.tabEditorViews[this.activeTabIndex]
        return this.getTabEditorData(view)
    }

    activateTabEditorById(id: number) {
        this.tabEditorViews.forEach((tabEditor, index) => {
            if (tabEditor.getViewId() === id) {
                tabEditor.setActive()
                this.activeTabIndex = index
            } else {
                tabEditor.setDeactive()
            }
        })
    }

    getTabEditorDataById(id: number): TabEditorDto {
        const view = this.tabEditorViews.find(_view => _view.getViewId() === id)
        if (!view) return null
        return this.getTabEditorData(view)
    }

    getAllTabEditorData(): TabEditorDto[] {
        return this.tabEditorViews.map(view => this.getTabEditorData(view))
    }

    applySaveResult(result: TabEditorDto) {
        let wasApplied = false
        for (let i = 0; i < this.tabEditorViews.length; i++) {
            const viewModel = this.getIdToTabViewModel(this.tabEditorViews[i].getViewId())
            if ((viewModel.id === result.id || viewModel.filePath === result.filePath) && result.isModified === false) {
                viewModel.isModified = false
                viewModel.filePath = result.filePath
                viewModel.fileName = result.fileName
                this.tabEditorViews[i].setTabSpanTextContent(result.fileName)
                this.tabEditorViews[i].setTabButtonTextContent(NOT_MODIFIED_TEXT)
                this.tabEditorViews[i].setContent(result.content)

                wasApplied = true
            }
        }
        return wasApplied
    }

    applySaveAllResults(results: TabEditorDto[]) {
        results.forEach((result, i) => {
            this.applySaveResult(result)
        })
    }

    removeContextTabId() {
        this._contextTabId = -1
    }

    removeTabAt(index: number) {
        this.tabEditorViews[index].destroyTabDiv()
        this.tabEditorViews[index].destroyEditorBoxDiv()
        this.tabEditorViews.splice(index, 1)
    }

    removeTab(id: number) {
        for (let i = 0; i < this.tabEditorViews.length; i++) {
            const view = this.tabEditorViews[i]
            if (view.getViewId() === id) {
                const wasActive = this.activeTabIndex >= i

                this.removeTabAt(i)

                if (wasActive || this.activeTabIndex > i) {
                    this.activeTabIndex = Math.max(0, this.activeTabIndex - 1)

                    if (this.tabEditorViews.length > 0) {
                        this.tabEditorViews[this.activeTabIndex].setActive()
                        this.activeTabId = this.tabEditorViews[this.activeTabIndex].getViewId()
                    } else {
                        this.activeTabId = -1
                    }
                }

                break
            }
        }
    }

    removeTabsExcept(results: boolean[]) {
        for (let i = this.tabEditorViews.length - 1; i >= 0; i--) {
            if (results[i]) this.removeTabAt(i)
        }

        const idx = this.tabEditorViews.findIndex(view => view.getViewId() === this.activeTabId)
        if (idx === -1) this.setLastTabAsActive()
        else this.activeTabIndex = idx
    }

    removeTabsToRight(results: boolean[]) {
        for (let i = this.tabEditorViews.length - 1; i >= 0; i--) {
            if (results[i]) this.removeTabAt(i)
        }

        const idx = this.tabEditorViews.findIndex(view => view.getViewId() === this.activeTabId)
        if (idx === -1) this.setLastTabAsActive()
        else this.activeTabIndex = idx
    }

    removeAllTabs(results: boolean[]) {
        for (let i = this.tabEditorViews.length - 1; i >= 0; i--) {
            if (results[i]) this.removeTabAt(i)
        }

        const idx = this.tabEditorViews.findIndex(view => view.getViewId() === this.activeTabId)
        if (idx === -1) this.setLastTabAsActive()
        else this.activeTabIndex = idx
    }

    undo() {
        this.tabEditorViews[this.activeTabIndex].editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            const { state, dispatch } = view
            undo(state, dispatch)
        })
    }

    redo() {
        this.tabEditorViews[this.activeTabIndex].editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            const { state, dispatch } = view
            redo(state, dispatch)
        })
    }

    private createTabBox(fileName: string) {
        const div = document.createElement('div')
        div.classList.add('tab')

        const span = document.createElement('span')
        span.textContent = fileName ? fileName : "Untitled"

        const button = document.createElement('button')
        button.textContent = NOT_MODIFIED_TEXT

        div.appendChild(span)
        div.appendChild(button)

        return { tabDiv: div, tabSpan: span, tabButton: button }
    }

    private setLastTabAsActive() {
        this.activeTabIndex = this.tabEditorViews.length - 1
        this.activeTabId = this.activeTabIndex >= 0 ? this.tabEditorViews[this.activeTabIndex].getViewId() : -1
        this.tabEditorViews[this.activeTabIndex].setActive()
    }

    private getIdToTabViewModel(id: number) {
        return this.idToTabViewModelMap.get(id)
    }

    private setIdToTabViewModel(id: number, viewModel: TabViewModel) {
        this.idToTabViewModelMap.set(id, viewModel)
    }

    private resolveFileName(view: TabEditorView): string {
        const id = view.getViewId()
        const viewModel = this.getIdToTabViewModel(id)

        if (!viewModel.fileName) return view.getEditorFirstLine()
        else return viewModel.fileName
    }

    get activeTabId() {
        return this._activeTabId
    }

    set activeTabId(id: number) {
        this._activeTabId = id
    }

    get activeTabIndex() {
        return this._activeTabIndex
    }

    set activeTabIndex(index: number) {
        this._activeTabIndex = index
    }

    get contextTabId() {
        return this._contextTabId
    }

    set contextTabId(id: number) {
        this._contextTabId = id
    }
}
