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
import ClipboardMode from "@shared/types/ClipboardMode"
import ITreeManager from "@main/modules/contracts/ITreeManager"

@injectable()
export default class TreeService implements ITreeService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.TreeManager) private readonly treeManager: ITreeManager,
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

    async copy(src: string, dest: string) {
        await this.fileManager.copy(src, dest)
    }

    async paste(targetDto: TreeDto, selectedDtos: TreeDto[], clipboardMode: ClipboardMode): Promise<boolean> {
        const copiedPaths: string[] = []
        const cutPaths: string[] = []

        const sortData = async (parent: TreeDto, child: TreeDto): Promise<void> => {
            if (!Array.isArray(child.children)) {
                child.children = []
            }

            // Childern first,
            for (const grandChild of child.children) {
                await sortData(child, grandChild)
            }

            const newPath = path.join(parent.path, child.name)
            await this.fileManager.copy(child.path, newPath)
            copiedPaths.push(newPath)

            if (clipboardMode === 'cut') cutPaths.push(child.path)

            child.path = newPath
            child.indent = parent.indent + 1
        }

        try {
            for (const child of selectedDtos) {
                await sortData(targetDto, child)
            }

            if (clipboardMode === 'cut') {
                for (const p of cutPaths) {
                    await this.fileManager.deletePermanently(p)
                }
            }

            return true
        } catch (err) {
            for (const p of copiedPaths) {
                try {
                    await this.fileManager.deletePermanently(p)
                } catch (deleteErr) {
                    console.error('Rollback failed to delete:', p, deleteErr)
                }
            }
            return false
        }
    }

    async delete(arr: string[]): Promise<TrashMap[] | null> {
        return await this.fileManager.moveToTrash(arr)
    }

    async undo_delete(trashMap: TrashMap[] | null): Promise<boolean> {
        return await this.fileManager.restoreFromTrash(trashMap)
    }

    async deletePermanently(path: string): Promise<void> {
        this.fileManager.deletePermanently(path)
    }

    async syncTreeSessionFromRenderer(dto: TreeDto): Promise<boolean> {
        try {
            await this.treeRepository.writeTreeSession(dto)
            return true
        } catch (e) {
            return false
        }
    }

    async getSyncedTreeSession(): Promise<TreeDto | null> {
        const session = await this.treeRepository.readTreeSession()
        const newSession = await this.treeManager.syncWithFs(session)
        if (newSession) await this.treeRepository.writeTreeSession(newSession)
        return newSession
    }
}
