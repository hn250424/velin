export default class TabViewModel {
    private _id: number
    private _isModified: boolean
    private _filePath: string
    private _fileName: string

    constructor(
        id: number,
        isModified: boolean,
        filePath: string,
        fileName: string,
    ) {
        this._id = id
        this._isModified = isModified
        this._filePath = filePath
        this._fileName = fileName
    }

    get id(): number {
        return this._id
    }

    get isModified(): boolean {
        return this._isModified
    }

    set isModified(status: boolean) {
        this._isModified = status
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
}