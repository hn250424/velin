import { TabSessionModel } from '@main/models/TabSessionModel'
import { inject, injectable } from 'inversify'
import DI_KEYS from '../../constants/di_keys'
import IFileManager from '../contracts/IFileManager'
import ITabUtils from '../contracts/ITabUtils'
import { TabEditorDto, TabEditorsDto } from '@shared/dto/TabEditorDto'

@injectable()
export default class TabUtils implements ITabUtils {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
    ) { }

    async syncSessionWithFs(session: TabSessionModel): Promise<TabSessionModel> {
        if (!session) return { activatedId: -1, data: [] }

        const syncedData = await Promise.all(
            session.data.map(async (data) => {
                const filePath = data.filePath ?? ''
                try {
                    const result = await this.fileManager.exists(filePath)
                    if (!result) throw new Error('No file path')
                    return data
                } catch {
                    return null
                }
            })
        )

        const filteredData: TabEditorDto[] = syncedData.filter((d): d is TabEditorDto  => d !== null)

        return {
            activatedId: session.activatedId,
            data: filteredData
        }
    }

    async toTabEditorsDto(session: TabSessionModel): Promise<TabEditorsDto> {
        const data = await Promise.all(
            session.data.map(async (data) => {
                let fileName = ''
                if (data.filePath) {
                    try {
                        fileName = this.fileManager.getBasename(data.filePath)
                    } catch {
                        fileName = ''
                    }
                }

                let content = ''
                if (data.filePath) {
                    try {
                        content = await this.fileManager.read(data.filePath)
                    } catch {
                        content = ''
                    }
                }
                return {
                    id: data.id,
                    isModified: false,
                    filePath: data.filePath,
                    fileName,
                    content,
                }
            })
        )

        return {
            activatedId: session.activatedId,
            data
        }
    }
}