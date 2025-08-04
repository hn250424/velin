import { TabSessionModel } from '@main/models/TabSessionModel'
import { inject, injectable } from 'inversify'
import DI_KEYS from '../../constants/di_keys'
import IFileManager from '../contracts/IFileManager'
import ITabManager from '../contracts/ITabManager'
import { TabEditorDto, TabEditorsDto } from '@shared/dto/TabEditorDto'

@injectable()
export default class TabManager implements ITabManager {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
    ) { }

    // async syncWithFs(session: TabSessionModel): Promise<TabSessionModel | null> {
    //     if (!session) return null
    //     const sessionData = session.data

    //     const newTabSessionArr = await Promise.all(
    //         sessionData.map(async (data) => {
    //             const filePath = data.filePath ?? ''
    //             try {
    //                 if (!filePath) throw new Error('No file path')

    //                 await this.fileManager.exists(filePath)
    //                 const fileName = this.fileManager.getBasename(filePath)
    //                 const content = await this.fileManager.read(data.filePath)
    //                 return {
    //                     id: data.id,
    //                     isModified: false,
    //                     filePath: filePath,
    //                     fileName: fileName,
    //                     content: content,
    //                 }
    //             } catch (e) {
    //                 return {
    //                     id: data.id,
    //                     isModified: false,
    //                     filePath: '',
    //                     fileName: '',
    //                     content: '',
    //                 }
    //             }
    //         })
    //     )

    //     return {
    //         activatedId: session.activatedId,
    //         data: newTabSessionArr
    //     }
    // }
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
                    // return { ...data, filePath: '' }
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
                // const fileName = data.filePath
                //     ? this.fileManager.getBasename(data.filePath)
                //     : ''
                // const content = data.filePath
                //     ? await this.fileManager.read(data.filePath)
                //     : ''
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