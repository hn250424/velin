
export default class TabDragManager {
    private _isDrag = false
    private _tab: HTMLElement | null = null
    private _tabId: number = -1
    private _x: number = 0
    private _y: number = 0
    private insertIndex: number | null = null

    isDrag(): boolean {
        return this._isDrag
    }

    startDrag(tab: HTMLElement) {
        this._isDrag = true
        this._tab = tab
    }

    updatePosition(x: number, y: number) {
        this._x = x
        this._y = y
    }

    endDrag() {
        this._isDrag = false
        this._tab = null
    }

    getPosition() {
        return { x: this._x, y: this._y }
    }

    getPosition_x() {
        return this._x
    }

    getDragTab() {
        return this._tab
    }

    getDragTabId() {
        return this._tabId
    }

    setDragTabId(id: number) {
        this._tabId = id
    }

    getInsertIndex(): number | null {
        return this.insertIndex
    }

    setInsertIndex(index: number) {
        this.insertIndex = index
    }
}