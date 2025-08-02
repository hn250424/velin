export default class TabDragManager {
    private _isMouseDown = false
    private _isDrag = false
    private _targetTab: HTMLElement | null = null
    private _tabs: HTMLElement[] | null = null
    private _targetTabId: number = -1
    private _targetTabName: string = ''
    private _start_x: number = 0
    private _start_y: number = 0
    private _insertIndex: number = -1

    isMouseDown(): boolean {
        return this._isMouseDown
    }

    setMouseDown(state: boolean) {
        this._isMouseDown = state
    }

    isDrag(): boolean {
        return this._isDrag
    }

    setTargetElement(tab: HTMLElement) {
        this._targetTab = tab
    }

    getTabs() {
        return this._tabs
    }

    setTabs(tabs: HTMLElement[]) {
        this._tabs = tabs
    }

    startDrag() {
        this._isDrag = true
    }

    endDrag() {
        this._isMouseDown = false
        this._isDrag = false
        this._targetTabId = -1
        this._targetTabName = ''
        this._targetTab = null
        this._tabs = null
        this._insertIndex = -1
        this._start_x = 0
        this._start_y = 0
    }

    getStartPosition() {
        return { x: this._start_x, y: this._start_y }
    }

    setStartPosition(x: number, y: number) {
        this._start_x = x
        this._start_y = y
    }

    getStartPosition_x() {
        return this._start_x
    }

    getStartPosition_y() {
        return this._start_y
    }

    getDragTargetTab() {
        return this._targetTab
    }

    getDragTargetTabId() {
        return this._targetTabId
    }

    setDragTargetTabId(id: number) {
        this._targetTabId = id
    }

    getDragTargetTabName() {
        return this._targetTabName
    }

    setDragTargetTabName(name: string) {
        this._targetTabName = name
    }

    getInsertIndex(): number | null {
        return this._insertIndex
    }

    setInsertIndex(index: number) {
        this._insertIndex = index
    }
}