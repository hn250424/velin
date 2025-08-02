import { TabSessionModel } from '@main/models/TabSessionModel'
import { inject, injectable } from 'inversify'
import DI_KEYS from '../../constants/di_keys'
import IFileManager from '../contracts/IFileManager'
import ITabManager from '../contracts/ITabManager'

@injectable()
export default class TabManager implements ITabManager {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
    ) { }

    async syncWithFs(session: TabSessionModel): Promise<TabSessionModel | null> {
        if (!session) return null
        const sessionData = session.data

        const newTabSessionArr = await Promise.all(
            sessionData.map(async (data) => {
                const filePath = data.filePath ?? ''
                try {
                    if (!filePath) throw new Error('No file path')

                    await this.fileManager.exists(filePath)
                    const fileName = this.fileManager.getBasename(filePath)
                    const content = await this.fileManager.read(data.filePath)
                    return {
                        id: data.id,
                        isModified: false,
                        filePath: filePath,
                        fileName: fileName,
                        content: content,
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
            data: newTabSessionArr
        }
    }
}