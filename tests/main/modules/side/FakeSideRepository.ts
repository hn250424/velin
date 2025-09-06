import SideSessionModel from "@main/models/SideSessionModel"
import IFileManager from "@main/modules/contracts/IFileManager"
import ISideRepository from "@main/modules/contracts/ISideRepository"

export default class FakeSideRepository implements ISideRepository {
    constructor(
        private sideSessionPath: string,
        private fakeFileManager: IFileManager,
    ) { }

    async readSideSession(): Promise<SideSessionModel | null> {
        if (!(await this.fakeFileManager.exists(this.sideSessionPath))) {
            return null
        }

        const json = await this.fakeFileManager.read(this.sideSessionPath)
        return JSON.parse(json)
    }

    async writeSideSession(model: SideSessionModel): Promise<void> {
        await this.fakeFileManager.write(this.sideSessionPath, JSON.stringify(model, null, 4))
    }

    async setSideSession(model: SideSessionModel): Promise<void> {
        await this.writeSideSession(model)
    }
}
