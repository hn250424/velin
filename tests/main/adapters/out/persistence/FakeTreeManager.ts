import ITreeManager from "@contracts/out/ITreeManager"
import TreeDto from "@shared/dto/TreeDto"

export default class FakeTreeManager implements ITreeManager {
    constructor() { }

    async getDirectoryTree(dirPath: string, indent: number = 0): Promise<TreeDto | null> {
        return null
    }
}