import { TabSessionModel } from "@main/models/TabSessionModel"
import IFileManager from "@main/modules/contracts/IFileManager"
import ITabManager from "@main/modules/contracts/ITabManager"

export default class FakeTabManager implements ITabManager {
    constructor(private fakeFileManager: IFileManager) {}

    async syncWithFs(session: TabSessionModel): Promise<TabSessionModel | null> {
        if (!session) return null
        const sessionData = session.data

        const newTabSessionArr = await Promise.all(
            sessionData.map(async (data) => {
                const filePath = data.filePath ?? ''
                try {
                    if (!filePath) throw new Error('No file path')

                    await this.fakeFileManager.exists(filePath)
                    const fileName = this.fakeFileManager.getBasename(filePath)
                    const content = await this.fakeFileManager.read(filePath)
                    return {
                        id: data.id,
                        isModified: false,
                        filePath,
                        fileName,
                        content,
                    }
                } catch (e) {
                    return {
                        id: data.id,
                        isModified: false,
                        filePath: '',
                        fileName: '',
                        content: '',
                    }
                }
            })
        )

        return {
            activatedId: session.activatedId,
            data: newTabSessionArr,
        }
    }
}
