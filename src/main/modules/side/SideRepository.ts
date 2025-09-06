import SideSessionModel from 'src/main/models/SideSessionModel'
import IFileManager from '@main/modules/contracts/IFileManager'
import ISideRepository from 'src/main/modules/contracts/ISideRepository'

export default class SideRepository implements ISideRepository {
    private session: SideSessionModel | null = null

    constructor(
        private sideSessionPath: string,
        private fileManager: IFileManager,
    ) {

    }

    async readSideSession(): Promise<SideSessionModel> {
        if (this.session) return this.session

        try {
            const json = await this.fileManager.read(this.sideSessionPath)
            this.session = JSON.parse(json)
            return this.session
        } catch (e) {
            return null
        }
    }

    async writeSideSession(model: SideSessionModel) {
        this.session = model
        this.fileManager.write(this.sideSessionPath, JSON.stringify(model, null, 4))
    }
}