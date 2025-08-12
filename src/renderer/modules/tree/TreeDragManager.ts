import { injectable } from "inversify"
import { CLASS_TREE_DRAG_OVERLAY } from "../../constants/dom"

@injectable()
export default class TreeDragManager {
    private _isMouseDown = false
    private _isDrag = false
    private _count: number = -1
    private _start_x: number = 0
    private _start_y: number = 0
    private _insertWrapper: HTMLElement | null = null
    private _insertPath: string = ''

    constructor() {}

    isMouseDown(): boolean {
        return this._isMouseDown
    }

    setMouseDown(state: boolean) {
        this._isMouseDown = state
    }

    isDrag(): boolean {
        return this._isDrag
    }

    startDrag() {
        this._isDrag = true
    }

    endDrag() {
        this._isMouseDown = false
        this._isDrag = false
        this._count = -1
        this._start_x = 0
        this._start_y = 0
        this._insertPath = ''
        if (this._insertWrapper) {
            this._insertWrapper.classList.remove(CLASS_TREE_DRAG_OVERLAY)
            this._insertWrapper = null
        }
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

    getDragTreeCount() {
        return this._count
    }

    setDragTreeCount(count: number) {
        this._count = count
    }

    getInsertWrapper() {
        return this._insertWrapper
    }

    setInsertWrapper(wrapper: HTMLElement | null) {
        this._insertWrapper = wrapper
    }

    getInsertPath() {
        return this._insertPath
    }

    setInsertPath(path: string) {
        this._insertPath = path
    }
}