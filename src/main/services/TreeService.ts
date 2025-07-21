import { inject, injectable } from "inversify"
import path from 'path'
import DI_KEYS from '../constants/di_keys'
import TreeSessionModel from '../models/TreeSessionModel'
import ITreeRepository from '../modules/contracts/ITreeRepository'
import ITreeService from "./contracts/ITreeService"
import IFileManager from "../modules/contracts/IFileManager"
import FileManager from "../modules/fs/FileManager"
import TreeDto from "@shared/dto/TreeDto"
import TrashMap from "@shared/types/TrashMap"

@injectable()
export default class TreeService implements ITreeService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.TreeReposotory) private readonly treeRepository: ITreeRepository
    ) {

    }

    async rename(prePath: string, newPath: string): Promise<boolean> {
        function _rename(prePath: string, node: TreeSessionModel): boolean {
            if (prePath === node.path) {
                const oldPath = node.path
                const updatePathsRecursively = (n: TreeSessionModel) => {
                    const relative = path.relative(oldPath, n.path)
                    n.path = path.join(newPath, relative)
                    n.name = path.basename(n.path)
                    for (const child of n.children ?? []) {
                        updatePathsRecursively(child)
                    }
                }
                updatePathsRecursively(node)
                return true
            } else {
                for (const child of node.children ?? []) {
                    const found = _rename(prePath, child)
                    if (found) return found
                }
                return false
            }
        }

        const session: TreeSessionModel = await this.treeRepository.readTreeSession()
        const result = _rename(prePath, session)
        if (result) {
            await this.fileManager.rename(prePath, newPath)
            await this.treeRepository.writeTreeSession(session)
        }
        return result
    }

    async delete(arr: string[]): Promise<TrashMap[] | null> {
        return await this.fileManager.delete(arr)
    }

    async undo_delete(trashMap: TrashMap[] | null): Promise<boolean> {
        return await this.fileManager.undo_delete(trashMap)
    }

    async syncTreeSession(dto: TreeDto): Promise<boolean> {
        try {
            await this.treeRepository.writeTreeSession(dto)
            return true
        } catch (e) {
            return false
        }
    }

    async requestTreeSession(): Promise<TreeDto | null> {
        return await this.treeRepository.syncTreeSessionWithFs()
    }
}
