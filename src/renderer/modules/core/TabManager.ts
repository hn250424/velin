import { Editor, rootCtx, editorViewCtx, parserCtx, serializerCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"

export default class TabManager {
    private static instance: TabManager | null = null
    private tabs: Tab[] = []

    private constructor() { }

    static getInstance(): TabManager {
        if (this.instance === null) {
            this.instance = new TabManager()
        }

        return this.instance
    }

    getTabsData(): { filePath: string; content: string }[] {
        return this.tabs.map(tab => ({
            filePath: tab.getFilePath(),
            content: tab.getContent()
        }))
    }

    async addTab(filePath: string = '', fileName: string = 'undefined', content: string = '') {
        this.tabs.forEach(tab => {
            tab.editorBoxDiv.style.display = 'none'
            tab.tabDiv.style.background = 'grey'
        })

        const tabDiv = this.createTabDiv(fileName)
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

        this.tabs.push(new Tab(filePath, fileName, content, tabDiv, editorBoxDiv, editor))
        this.setActiveTab(this.tabs.length - 1)
    }

    private createTabDiv(fileName: string) {
        const tabDiv = document.createElement('div')
        tabDiv.classList.add('tab')

        const p = document.createElement('p')
        p.textContent = fileName

        const span = document.createElement('span')
        span.textContent = 'x'

        tabDiv.appendChild(p)
        tabDiv.appendChild(span)

        tabDiv.addEventListener('click', () => {
            const index = this.tabs.findIndex(tab => tab.tabDiv === tabDiv)
            if (index !== -1) {
                this.setActiveTab(index)
            }
        })

        return tabDiv
    }

    setActiveTab(index: number) {
        this.tabs.forEach((tab, i) => {
            tab.editorBoxDiv.style.display = i === index ? 'block' : 'none'
            tab.tabDiv.style.background = i === index ? 'red' : 'grey'
        })
    }
}

class Tab {
    private id: number
    private order: number
    private filePath: string
    private fileName: string
    private content: string
    private editor: Editor
    public tabDiv: HTMLElement
    public editorBoxDiv: HTMLElement

    constructor(
        filePath: string,
        fileName: string,
        content: string,
        tabDiv: HTMLElement,
        editorBoxDiv: HTMLElement,
        editor: Editor
    ) {
        this.filePath = filePath
        this.fileName = fileName
        this.content = content
        this.tabDiv = tabDiv
        this.editorBoxDiv = editorBoxDiv
        this.editor = editor
    }

    getFilePath(): string {
        return this.filePath
    }

    getContent(): string {
        return this.content
    }
}