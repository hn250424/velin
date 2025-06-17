import { serializerCtx } from '@milkdown/core'
import { Editor, editorViewCtx, parserCtx, rootCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"
import TabData from '../../../shared/interface/TabData'

export default class TabManager {
    private static instance: TabManager | null = null
    private tabs: Tab[] = []
    private id = 0
    private activatedTabIndex = 0

    private constructor() { }

    static getInstance(): TabManager {
        if (this.instance === null) {
            this.instance = new TabManager()
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
        const { tabDiv, tabP, tabSpan } = this.createTabBox(fileName)
        document.getElementById('tab_container').appendChild(tabDiv)

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
        document.getElementById('editor_container').appendChild(editorBoxDiv)

        this.tabs.push(new Tab(id, filePath, fileName, tabDiv, tabP, tabSpan, editorBoxDiv, editor))
        if (activate) {
            this.tabs.forEach((tab, i) => {
                tab.setActive(i === this.tabs.length - 1)
            })
            this.activatedTabIndex = this.tabs.length - 1
        }
    }

    getActivatedTab(): TabData {
        const tab = this.tabs[this.activatedTabIndex]
        return {
            id: tab.getId(),
            isModified: tab.isModified(),
            filePath: tab.getFilePath(),
            fileName: tab.resolveFileName(),
            content: tab.getContent(),
        }
    }

    getTabData(): TabData[] {
        return this.tabs.map(tab => ({
            id: tab.getId(),
            isModified: tab.isModified(),
            filePath: tab.getFilePath(),
            fileName: tab.resolveFileName(),
            content: tab.getContent(),
        }))
    }

    applySaveResult(result: TabData) {
        const tab = this.tabs.find(tab => tab.getId() === result.id)
        tab.setFilePath(result.filePath)
        tab.setFileName(result.fileName)
        tab.setTabPTextContent(result.fileName)
        tab.setTabSpanTextContent('x')
    }

    applySaveAllResults(results: TabData[]) {
        results.forEach((result, i) => {
            if (!result.isModified) {
                const tab = this.tabs[i]
                tab.setFilePath(result.filePath)
                tab.setFileName(result.fileName)
                tab.setTabPTextContent(result.fileName)
                tab.setTabSpanTextContent('x')
            }
        })
    }

    private createTabBox(fileName: string) {
        const div = document.createElement('div')
        div.classList.add('tab')

        const p = document.createElement('p')
        p.textContent = fileName ? fileName : "Untitled"

        const span = document.createElement('span')
        span.textContent = 'x'

        div.appendChild(p)
        div.appendChild(span)

        div.addEventListener('click', () => {
            const index = this.tabs.findIndex(tab => tab.getTabDiv() === div)
            if (index !== -1) {
                this.tabs.forEach((tab, i) => {
                    tab.setActive(i === index)
                })

                this.activatedTabIndex = index
            }
        })

        return { tabDiv: div, tabP: p, tabSpan: span }
    }
}

class Tab {
    private id: number
    private order: number
    private filePath: string
    private fileName: string
    private editor: Editor
    private tabDiv: HTMLElement
    private tabP: HTMLElement
    private tabSpan: HTMLElement
    private editorBoxDiv: HTMLElement

    private _isModified: boolean = false

    constructor(
        id: number,
        filePath: string,
        fileName: string,
        tabDiv: HTMLElement,
        tabP: HTMLElement,
        tabSpan: HTMLElement,
        editorBoxDiv: HTMLElement,
        editor: Editor
    ) {
        this.id = id
        this.filePath = filePath
        this.fileName = fileName
        this.tabDiv = tabDiv
        this.tabP = tabP
        this.tabSpan = tabSpan
        this.editorBoxDiv = editorBoxDiv
        this.editor = editor

        editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)

            view.setProps({
                handleDOMEvents: {
                    input: (view, event) => {
                        if (!this.isModified()) {
                            this.setTabSpanTextContent('o')
                            this.setModified(true)
                        }
                        return false
                    },

                    blur: (view, event) => {
                        if (this.getFilePath() === '' && this.isModified()) {
                            const firstLine = view.state.doc.textBetween(0, view.state.doc.content.size).split('\n')[0].trim()
                            if (firstLine) this.setTabPTextContent(firstLine)
                            else this.setTabPTextContent('Untitled')
                        }
                        return false
                    }
                },
            })
        })
    }

    getId(): number {
        return this.id
    }

    getOrder(): number {
        return this.order
    }

    getFilePath(): string {
        return this.filePath
    }

    setFilePath(filePath: string) {
        this.filePath = filePath
    }

    resolveFileName(): string {
        if (!this.fileName) {
            const view = this.getEditor().ctx.get(editorViewCtx)
            const firstLine = view.state.doc
                .textBetween(0, view.state.doc.content.size)
                .split('\n')[0]
                .trim()
            this.fileName = firstLine || 'Untitled'
        }

        return this.fileName
    }

    setFileName(fileName: string) {
        this.fileName = fileName
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

    getEditor(): Editor {
        return this.editor
    }

    getTabDiv() {
        return this.tabDiv
    }

    // getTabPTextContent(): string {
    //     return this.tabP.textContent || ''
    // }

    setTabPTextContent(text: string) {
        this.tabP.textContent = text
    }

    setTabSpanTextContent(text: string) {
        this.tabSpan.textContent = text
    }

    setModified(status: boolean) {
        this._isModified = status
    }

    isModified(): boolean {
        return this._isModified
    }

    setActive(isActive: boolean) {
        this.editorBoxDiv.style.display = isActive ? 'block' : 'none';
        this.tabDiv.style.background = isActive ? 'red' : 'grey';
    }
}