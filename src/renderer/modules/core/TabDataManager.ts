import { serializerCtx } from '@milkdown/core'
import { Editor, editorViewCtx, parserCtx, rootCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import { undo, redo } from 'prosemirror-history'
import "@milkdown/theme-nord/style.css"
import TabData from '@shared/types/TabData'
import { DATASET_ATTR_TAB_ID, MODIFIED_TEXT, NOT_MODIFIED_TEXT } from '../../constants/dom'

export default class TabDataManager {
    private static instance: TabDataManager | null = null
    private tabs: Tab[] = []
    private _activeTabId = -1
    private _activeTabIndex = -1  // file.
    private _contextTabId = -1  // contextmenu.

    private tabContainer: HTMLElement
    private editorContainer: HTMLElement

    private constructor() {
        this.tabContainer = document.getElementById('tab_container')
        this.editorContainer = document.getElementById('editor_container')
    }

    static getInstance(): TabDataManager {
        if (this.instance === null) {
            this.instance = new TabDataManager()
        }

        return this.instance
    }

    async restoreTabs(tabs: TabData[]) {
        const lastIndex = tabs.length - 1
        for (let i = 0; i < lastIndex; i++) {
            await this.addTab(tabs[i].id, tabs[i].filePath, tabs[i].fileName, tabs[i].content, false)
        }

        await this.addTab(tabs[lastIndex].id, tabs[lastIndex].filePath, tabs[lastIndex].fileName, tabs[lastIndex].content, true)
    }

    async addTab(id: number = 0, filePath: string = '', fileName: string = '', content: string = '', activate: boolean = true) {
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

        this.tabs.push(new Tab(id, filePath, fileName, tabDiv, tabSpan, tabButton, editorBoxDiv, editor))
        if (activate) {
            this.tabs[this.activeTabIndex]?.setDeactive()
            this.activeTabIndex = this.tabs.length - 1
            this.tabs[this.activeTabIndex].setActive()
            this.activeTabId = id
        }
    }

    getActivatedTabData(): TabData {
        const tab = this.tabs[this.activeTabIndex]
        return {
            id: tab.id,
            isModified: tab.isModified,
            filePath: tab.filePath,
            fileName: tab.resolveFileName(),
            content: tab.getContent(),
        }
    }

    activateTabById(id: number) {
        this.tabs.forEach((tab, index) => {
            if (tab.id === id) {
                tab.setActive()
                this.activeTabIndex = index
            } else {
                tab.setDeactive()
            }
        })
    }

    removeContextTabId() {
        this._contextTabId = -1
    }

    getTabDataById(id: number): TabData {
        const tab = this.tabs.find(tab => tab.id === id)
        if (!tab) return null
        return {
            id: tab.id,
            isModified: tab.isModified,
            filePath: tab.filePath,
            fileName: tab.resolveFileName(),
            content: tab.getContent(),
        }
    }

    getAllTabData(): TabData[] {
        return this.tabs.map(tab => ({
            id: tab.id,
            isModified: tab.isModified,
            filePath: tab.filePath,
            fileName: tab.resolveFileName(),
            content: tab.getContent(),
        }))
    }

    applySaveResult(result: TabData) {
        let wasApplied = false
        for (let i = 0; i < this.tabs.length; i++) {
            if ((this.tabs[i].id === result.id || this.tabs[i].filePath === result.filePath) && result.isModified === false) {
                this.tabs[i].isModified = false
                this.tabs[i].filePath = result.filePath
                this.tabs[i].fileName = result.fileName
                this.tabs[i].setTabSpanTextContent(result.fileName)
                this.tabs[i].setTabButtonTextContent(NOT_MODIFIED_TEXT)
                this.tabs[i].setContent(result.content)

                wasApplied = true
            }
        }
        return wasApplied
    }

    applySaveAllResults(results: TabData[]) {
        results.forEach((result, i) => {
            this.applySaveResult(result)
        })
    }

    removeTabAt(index: number) {
        this.tabs[index].destroyTabDiv()
        this.tabs[index].destroyEditorBoxDiv()
        this.tabs.splice(index, 1)
    }

    removeTab(id: number) {
        for (let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i]
            if (tab.id === id) {
                const couldModify = this.activeTabIndex >= i

                this.removeTabAt(i)

                if (couldModify) {
                    this.activeTabIndex--

                    if (this.activeTabIndex > -1) {
                        this.tabs[this.activeTabIndex].setActive()
                        this.activeTabId = this.tabs[this.activeTabIndex].id
                    }
                }

                break
            }
        }
    }

    removeTabsExcept(results: boolean[]) {
        for (let i = this.tabs.length - 1; i >= 0; i--) {
            if (results[i]) this.removeTabAt(i)
        }

        const idx = this.tabs.findIndex(tab => tab.id === this.activeTabId)
        if (idx === -1) this.setLastTabAsActive()
        else this.activeTabIndex = idx
    }

    removeTabsToRight(results: boolean[]) {
        for (let i = this.tabs.length - 1; i >= 0; i--) {
            if (results[i]) this.removeTabAt(i)
        }

        const idx = this.tabs.findIndex(tab => tab.id === this.activeTabId)
        if (idx === -1) this.setLastTabAsActive()
        else this.activeTabIndex = idx
    }

    removeAllTabs(results: boolean[]) {
        for (let i = this.tabs.length - 1; i >= 0; i--) {
            if (results[i]) this.removeTabAt(i)
        }

        const idx = this.tabs.findIndex(tab => tab.id === this.activeTabId)
        if (idx === -1) this.setLastTabAsActive()
        else this.activeTabIndex = idx
    }

    undo() {
        this.tabs[this.activeTabIndex].editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            const { state, dispatch } = view
            undo(state, dispatch)
        })
    }

    redo() {
        this.tabs[this.activeTabIndex].editor.action((ctx) => {
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
        this.activeTabIndex = this.tabs.length - 1
        this.activeTabId = this.activeTabIndex >= 0 ? this.tabs[this.activeTabIndex].id : -1
        this.tabs[this.activeTabIndex].setActive()
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

class Tab {
    private _id: number
    private _order: number
    private _filePath: string
    private _fileName: string
    private _editor: Editor
    private _tabDiv: HTMLElement
    private _tabSpan: HTMLElement
    private _tabButton: HTMLElement
    private _editorBoxDiv: HTMLElement

    private _isModified: boolean

    constructor(
        id: number,
        filePath: string,
        fileName: string,
        tabDiv: HTMLElement,
        tabSpan: HTMLElement,
        tabButton: HTMLElement,
        editorBoxDiv: HTMLElement,
        editor: Editor
    ) {
        this._id = id
        this._filePath = filePath
        this._fileName = fileName
        this._tabDiv = tabDiv
        this._tabSpan = tabSpan
        this._tabButton = tabButton
        this._editorBoxDiv = editorBoxDiv
        this._editor = editor
        this._isModified = false

        editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)

            // const newPlugins = [...view.state.plugins, TypingLoggerPlugin]
            // const newState = view.state.reconfigure({ plugins: newPlugins })
            // view.updateState(newState)

            view.setProps({
                handleDOMEvents: {
                    input: (view, event) => {
                        if (!this.isModified) {
                            this.setTabButtonTextContent(MODIFIED_TEXT)
                            this.isModified = true
                        }
                        return false
                    },

                    blur: (view, event) => {
                        if (!this.filePath && this.isModified) {
                            const firstLine = view.state.doc.textBetween(0, view.state.doc.content.size).split('\n')[0].trim()
                            if (firstLine) this.setTabSpanTextContent(firstLine)
                            else this.setTabSpanTextContent('Untitled')
                        }
                        return false
                    }
                },
            })
        })
    }

    resolveFileName(): string {
        if (!this.fileName) {
            const view = this.editor.ctx.get(editorViewCtx)
            const firstLine = view.state.doc
                .textBetween(0, view.state.doc.content.size)
                .split('\n')[0]
                .trim()

            return firstLine || 'Untitled'
        } else {
            return this.fileName
        }
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

    get id(): number {
        return this._id
    }

    get order(): number {
        return this._order
    }

    get filePath(): string {
        return this._filePath
    }

    set filePath(filePath: string) {
        this._filePath = filePath
    }

    get fileName() {
        return this._fileName
    }

    set fileName(fileName: string) {
        this._fileName = fileName
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

    set isModified(status: boolean) {
        this._isModified = status
    }

    get isModified(): boolean {
        return this._isModified
    }

    get editorBoxDiv() {
        return this._editorBoxDiv
    }
}

// import { Plugin } from 'prosemirror-state'
// const TypingLoggerPlugin = new Plugin({
//     props: {
//         handleDOMEvents: {
//             input(view, event) {
//                 console.log('Typing detected!')
//                 return false
//             },
//         },
//     },
// })