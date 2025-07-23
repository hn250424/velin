import TreeDto from "@shared/dto/TreeDto"
import TreeSessionModel from "src/main/models/TreeSessionModel"

export default interface ITreeRepository {
    readTreeSession(): Promise<TreeSessionModel | null>
    writeTreeSession(model: TreeSessionModel): Promise<void>
    // updateSessionWithFsData(dirPath: string, indent: number, fsChildren: TreeDto[]): Promise<TreeSessionModel | null>
    // syncTreeSessionWithFs(): Promise<TreeSessionModel | null>
}