import { Editor, editorViewCtx, parserCtx, rootCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"
import { TabEditorDto, TabEditorsDto } from '@shared/dto/TabEditorDto'
import { redo, undo } from 'prosemirror-history'
import TabViewModel from '../../viewmodels/TabViewModel'
import TabEditorView from '../../views/TabEditorView'
import { DATASET_ATTR_TAB_ID, NOT_MODIFIED_TEXT } from '../../constants/dom'
import { MODIFIED_TEXT } from "../../constants/dom"

export default class TabEditorManager {
    private static instance: TabEditorManager | null = null
    
    private tabEditorViews: TabEditorView[] = []
    private idToTabViewModelMap: Map<number, TabViewModel> = new Map()
    private pathToTabEditorViewMap: Map<string, TabEditorView> = new Map()

    private _activeTabId = -1
    private _activeTabIndex = -1
    private _contextTabId = -1

    private tabContainer: HTMLElement
    private editorContainer: HTMLElement

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

    async restoreTabs(dto: TabEditorsDto) {
        this._activeTabId = dto.activatedId
        const tabs = dto.data

        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].id === this._activeTabId) await this.addTab(tabs[i].id, tabs[i].filePath, tabs[i].fileName, tabs[i].content, true)
            else await this.addTab(tabs[i].id, tabs[i].filePath, tabs[i].fileName, tabs[i].content, false)
        }
    }

    async addTab(id: number = 0, filePath: string = '', fileName: string = '', content: string = '', activate: boolean = true) {
        const tabViewModel = { id: id, isModified: false, filePath: filePath, fileName: fileName }
        this.setTabViewModelById(id, tabViewModel)

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
        this.setTabEditorViewByPath(filePath, tabEditorView)
        if (activate) {
            this.tabEditorViews[this.activeTabIndex]?.setDeactive()
            this.activeTabIndex = this.tabEditorViews.length - 1
            this.tabEditorViews[this.activeTabIndex].setActive()
            this.activeTabId = id
        }
    }

    getTabEditorData(view: TabEditorView): TabEditorDto {
        const id = view.getId()
        const data = this.getTabViewModelById(id)

        return {
            id: data.id,
            isModified: data.isModified,
            filePath: data.filePath,
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
            if (tabEditor.getId() === id) {
                tabEditor.setActive()
                this.activeTabId = id
                this.activeTabIndex = index
            } else {
                tabEditor.setDeactive()
            }
        })
    }

    getTabEditorDataById(id: number): TabEditorDto {
        const view = this.tabEditorViews.find(_view => _view.getId() === id)
        if (!view) return null
        return this.getTabEditorData(view)
    }

    getAllTabEditorData(): TabEditorsDto {
        return {
            activatedId: this._activeTabId,
            data: this.tabEditorViews.map(view => this.getTabEditorData(view))
        }
    }

    applySaveResult(result: TabEditorDto) {
        let wasApplied = false
        for (let i = 0; i < this.tabEditorViews.length; i++) {
            const data = this.getTabViewModelById(this.tabEditorViews[i].getId())
            if ((data.id === result.id || data.filePath === result.filePath) && result.isModified === false) {
                data.isModified = false
                data.filePath = result.filePath
                data.fileName = result.fileName
                this.tabEditorViews[i].setTabSpanTextContent(result.fileName)
                this.tabEditorViews[i].setTabButtonTextContent(NOT_MODIFIED_TEXT)
                this.tabEditorViews[i].setContent(result.content)

                wasApplied = true
            }
        }
        return wasApplied
    }

    applySaveAllResults(results: TabEditorsDto) {
        results.data.forEach((result, i) => {
            this.applySaveResult(result)
        })
    }

    removeContextTabId() {
        this._contextTabId = -1
    }

    removeTabAt(index: number) {
        const tabEditorView = this.tabEditorViews[index]
        const id = tabEditorView.getId()
        const viewModel = this.getTabViewModelById(id)
        
        this.pathToTabEditorViewMap.delete(viewModel.filePath)
        this.idToTabViewModelMap.delete(id)

        this.tabEditorViews[index].destroy()
        this.tabEditorViews.splice(index, 1)
    }

    removeTab(id: number) {
        for (let i = 0; i < this.tabEditorViews.length; i++) {
            const view = this.tabEditorViews[i]
            if (view.getId() === id) {
                const wasActive = this.activeTabIndex >= i

                this.removeTabAt(i)

                if (wasActive || this.activeTabIndex > i) {
                    this.activeTabIndex = Math.max(0, this.activeTabIndex - 1)

                    if (this.tabEditorViews.length > 0) {
                        this.tabEditorViews[this.activeTabIndex].setActive()
                        this.activeTabId = this.tabEditorViews[this.activeTabIndex].getId()
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

        const idx = this.tabEditorViews.findIndex(view => view.getId() === this.activeTabId)
        if (idx === -1) this.setLastTabAsActive()
        else this.activeTabIndex = idx
    }

    removeTabsToRight(results: boolean[]) {
        for (let i = this.tabEditorViews.length - 1; i >= 0; i--) {
            if (results[i]) this.removeTabAt(i)
        }

        const idx = this.tabEditorViews.findIndex(view => view.getId() === this.activeTabId)
        if (idx === -1) this.setLastTabAsActive()
        else this.activeTabIndex = idx
    }

    removeAllTabs(results: boolean[]) {
        for (let i = this.tabEditorViews.length - 1; i >= 0; i--) {
            if (results[i]) this.removeTabAt(i)
        }

        const idx = this.tabEditorViews.findIndex(view => view.getId() === this.activeTabId)
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
        this.activeTabId = this.activeTabIndex >= 0 ? this.tabEditorViews[this.activeTabIndex].getId() : -1
        this.tabEditorViews[this.activeTabIndex].setActive()
    }

    private getTabViewModelById(id: number) {
        return this.idToTabViewModelMap.get(id)
    }

    private setTabViewModelById(id: number, viewModel: TabViewModel) {
        this.idToTabViewModelMap.set(id, viewModel)
    }

    getTabEditorViewByPath(path: string) {
        return this.pathToTabEditorViewMap.get(path)
    }

    private setTabEditorViewByPath(path: string, tabEditorVeiw: TabEditorView) {
        this.pathToTabEditorViewMap.set(path, tabEditorVeiw)
    }

    private resolveFileName(view: TabEditorView): string {
        const id = view.getId()
        const data = this.getTabViewModelById(id)

        if (!data.fileName) return view.getEditorFirstLine()
        else return data.fileName
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
