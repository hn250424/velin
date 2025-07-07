import ITreeRepository from "@contracts/out/ITreeRepository"
import TreeDto from "@shared/dto/TreeDto"
import TreeSessionModel from "src/main/models/TreeSessionModel"

export default class FakeTreeRepository implements ITreeRepository {
    constructor() { }

    getDirectoryTree(dirPath: string): TreeDto {
        return null
    }

    async readTreeSession(): Promise<TreeSessionModel | null> {
        return null
    }

    async updateSessionWithFsData(dirPath: string, indent: number, fsChildren: TreeDto[]): Promise<TreeSessionModel | null> {
        return null
    }
}