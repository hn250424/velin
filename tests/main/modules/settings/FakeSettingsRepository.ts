import SettingsSessionModel from "@main/models/SettingsSessionModel"
import IFileManager from "@main/modules/contracts/IFileManager"
import ISettingsRepository from "@main/modules/contracts/ISettingsRepository"

export default class FakeSettingsRepository implements ISettingsRepository {
    constructor(
        private settingsSessionPath: string,
        private fakeFileManager: IFileManager,
    ) { }

    async readSettingsSession(): Promise<SettingsSessionModel | null> {
        if (!(await this.fakeFileManager.exists(this.settingsSessionPath))) {
            return null
        }

        const json = await this.fakeFileManager.read(this.settingsSessionPath)
        return JSON.parse(json)
    }

    async writeSettingsSession(model: SettingsSessionModel): Promise<void> {
        await this.fakeFileManager.write(this.settingsSessionPath, JSON.stringify(model, null, 4))
    }

    async setSettingsSession(model: SettingsSessionModel): Promise<void> {
        await this.writeSettingsSession(model)
    }
}
