import { inject, injectable } from "inversify"
import path from 'path'
import DI_KEYS from '../constants/di_keys'
import TreeSessionModel from '../models/TreeSessionModel'
import ITreeRepository from '../modules/contracts/ITreeRepository'
import ITreeService from "./contracts/ITreeService"
import IFileManager from "../modules/contracts/IFileManager"
import FileManager from "../modules/fs/FileManager"

@injectable()
export default class TreeService implements ITreeService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.TreeReposotory) private readonly treeRepository: ITreeRepository
    ) {

    }

    async rename(prePath: string, newName: string): Promise<string | null> {
        function _rename(prePath: string, node: TreeSessionModel): string | null {
            if (prePath === node.path) {
                const newBase = path.join(path.dirname(node.path), newName)
                const oldBase = node.path
                const updatePathsRecursively = (n: TreeSessionModel) => {
                    n.path = n.path.replace(oldBase, newBase)
                    n.name = path.basename(n.path)
                    for (const child of n.children ?? []) {
                        updatePathsRecursively(child)
                    }
                }
                updatePathsRecursively(node)
                return newBase
            } else {
                for (const child of node.children ?? []) {
                    const found = _rename(prePath, child)
                    if (found) return found
                }
                return null
            }
        }

        const session: TreeSessionModel = await this.treeRepository.readTreeSession()
        const newPath = _rename(prePath, session)
        if (newPath) {
            await this.fileManager.rename(prePath, newPath)
            await this.treeRepository.writeTreeSession(session)
        }
        return newPath
    }
}
