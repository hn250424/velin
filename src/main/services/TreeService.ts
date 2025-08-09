import { inject } from "inversify"
import path from 'path'
import DI_KEYS from '../constants/di_keys'
import TreeSessionModel from '../models/TreeSessionModel'
import ITreeRepository from '../modules/contracts/ITreeRepository'
import IFileManager from "../modules/contracts/IFileManager"
import TreeDto from "@shared/dto/TreeDto"
import TrashMap from "@shared/types/TrashMap"
import ClipboardMode from "@shared/types/ClipboardMode"
import ITreeManager from "@main/modules/contracts/ITreeManager"
import Response from "@shared/types/Response"

export default class TreeService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.TreeManager) private readonly treeManager: ITreeManager,
        @inject(DI_KEYS.TreeReposotory) private readonly treeRepository: ITreeRepository
    ) {

    }

    async rename(prePath: string, newPath: string): Promise<Response<string>> {
        function updateTreeSession(prePath: string, finalNewPath: string, node: TreeSessionModel): boolean {
            if (prePath === node.path) {
                const oldPath = node.path

                const recursivelyUpdatePaths = (n: TreeSessionModel) => {
                    const relative = path.relative(oldPath, n.path)
                    n.path = path.join(finalNewPath, relative)
                    n.name = path.basename(n.path)
                    for (const child of n.children ?? []) {
                        recursivelyUpdatePaths(child)
                    }
                }
                recursivelyUpdatePaths(node)
                return true
            } else {
                for (const child of node.children ?? []) {
                    const found = updateTreeSession(prePath, finalNewPath, child)
                    if (found) return found
                }
                return false
            }
        }

        const session: TreeSessionModel = await this.treeRepository.readTreeSession()

        const targetDir = path.dirname(newPath)
        const existingNames = new Set(await this.fileManager.readDir(targetDir))
        const requestedFileName = path.basename(newPath)
        
        const uniqueFileName = this.fileManager.getUniqueFileNames(existingNames, [requestedFileName])
        const finalNewPath = path.join(targetDir, uniqueFileName[0])

        const updated = updateTreeSession(prePath, finalNewPath, session)
        if (updated) {
            await this.fileManager.rename(prePath, finalNewPath)
            await this.treeRepository.writeTreeSession(session)
        }

        return {
            result: updated,
            data: finalNewPath
        }
    }

    async copy(src: string, dest: string) {
        await this.fileManager.copy(src, dest)
    }

    async paste(targetDto: TreeDto, selectedDtos: TreeDto[], clipboardMode: ClipboardMode): Promise<Response<string[]>> {
        const copiedPaths: string[] = []
        const cutPaths: string[] = []
        const originalNames = selectedDtos.map(dto => dto.name)
        const targetDir = targetDto.path
        const existingNames = new Set(await this.fileManager.readDir(targetDir))
        const uniqueNames = this.fileManager.getUniqueFileNames(existingNames, originalNames)

        const sortData = async (parent: TreeDto, child: TreeDto): Promise<void> => {
            if (!Array.isArray(child.children)) {
                child.children = []
            }

            // Children first,
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
            for (const [index, child] of selectedDtos.entries()) {
                const fileName = uniqueNames[index]
                child.name = fileName
                await sortData(targetDto, child)
            }

            if (clipboardMode === 'cut') {
                for (const p of cutPaths) {
                    await this.fileManager.deletePermanently(p)
                }
            }

            return {
                result: true,
                data: copiedPaths
            }
        } catch (err) {
            for (const p of copiedPaths) {
                try {
                    await this.fileManager.deletePermanently(p)
                } catch (deleteErr) {
                    console.error('Rollback failed to delete:', p, deleteErr)
                }
            }
            return {
                result: false,
                data: []
            }
        }
    }

    async delete(arr: string[]): Promise<TrashMap[] | null> {
        return await this.fileManager.moveToTrash(arr)
    }

    async undo_delete(trashMap: TrashMap[] | null): Promise<boolean> {
        return await this.fileManager.restoreFromTrash(trashMap)
    }

    async deletePermanently(path: string): Promise<void> {
        await this.fileManager.deletePermanently(path)
    }

    async create(targetPath: string, directory: boolean) {
        const dir = path.dirname(targetPath)
        const base = path.basename(targetPath)
        const existingNames = new Set(await this.fileManager.readDir(dir))

        const res = this.fileManager.getUniqueFileNames(existingNames, [base])
        const uniqueName = res[0]

        const uniquePath = path.join(dir, uniqueName)
        await this.fileManager.create(uniquePath, directory)
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
