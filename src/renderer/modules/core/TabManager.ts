import { serializerCtx } from '@milkdown/core'
import { Editor, editorViewCtx, parserCtx, rootCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"
import TabsData from '../../../shared/interface/TabsData'
import SaveAllResponse from '../../../shared/interface/SaveAllResponse'

export default class TabManager {
    private static instance: TabManager | null = null
    private tabs: Tab[] = []
    private id = 0
    private order = 0

    private constructor() { }

    static getInstance(): TabManager {
        if (this.instance === null) {
            this.instance = new TabManager()
        }

        return this.instance
    }

    getTabsData(): TabsData[] {
        const result: TabsData[] = []

        for (const tab of this.tabs) {
            let fileName = tab.getFileName()

            if (!fileName) {
                const view = tab.getEditor().ctx.get(editorViewCtx)
                if (view) {
                    const firstLine = view.state.doc
                        .textBetween(0, view.state.doc.content.size)
                        .split('\n')[0]
                        .trim()
                    fileName = firstLine || 'Untitled'
                } else {
                    fileName = 'Untitled'
                }
            }

            result.push({
                id: tab.getId(),
                isModified: tab.isModified(),
                order: tab.getOrder(),
                filePath: tab.getFilePath(),
                fileName: fileName,
                content: tab.getContent(),
            })
        }

        return result
    }

    async addTab(filePath: string = '', fileName: string = '', content: string = '') {
        const { tabDiv, tabP, tabSpan } = this.createTabBox(fileName)
        document.getElementById('tab_container').appendChild(tabDiv)

        const editorBoxDiv = document.createElement('div')
        editorBoxDiv.className = 'editorBox'
        editorBoxDiv.style.display = 'block'
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

        this.tabs.push(new Tab(this.id++, this.order++, filePath, fileName, tabDiv, tabP, tabSpan, editorBoxDiv, editor))
        this.tabs.forEach((tab, i) => {
            tab.setActive(i === this.tabs.length - 1)
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
            }
        })

        return { tabDiv: div, tabP: p, tabSpan: span }
    }

    applySaveAllResults(results: SaveAllResponse[]) {
        results.forEach(({ id, isSaved, filePath, fileName }) => {
            const tab = this.tabs.find(t => t.getId() === id)
            if (isSaved) {
                tab.setModified(false)
                tab.setFilePath(filePath)
                tab.setFileName(fileName)
                tab.setTabPTextContent(fileName)
                tab.setTabSpanTextContent('x')
            }
        })
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
        order: number,
        filePath: string,
        fileName: string,
        tabDiv: HTMLElement,
        tabP: HTMLElement,
        tabSpan: HTMLElement,
        editorBoxDiv: HTMLElement,
        editor: Editor
    ) {
        this.id = id
        this.order = order
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
                        if (!this._isModified) {
                            this.tabSpan.textContent = 'o'
                            this._isModified = true
                        }
                        return false
                    },

                    blur: (view, event) => {
                        if (this.filePath === '' && this._isModified) {
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

    getFileName(): string {
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