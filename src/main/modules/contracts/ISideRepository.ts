import SideSessionModel from "src/main/models/SideSessionModel"

export default interface ISideRepository {
    readSideSession(): Promise<SideSessionModel | null>
    writeSideSession(model: SideSessionModel): Promise<void>
}