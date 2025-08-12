import fs from 'fs'
import fsExtra from 'fs-extra'
import path, { dirname } from 'path'
import { app } from 'electron'
import IFileManager from "@main/modules/contracts/IFileManager"
import { injectable } from 'inversify'
import TrashMap from '@shared/types/TrashMap'

@injectable()
export default class FileManager implements IFileManager {
    private trashId = 0

    constructor() { }

    async exists(path: string): Promise<boolean> {
        try {
            await fs.promises.access(path)
            return true
        } catch (e) {
            return false
        }
    }

    getBasename(filePath: string): string {
        return path.basename(filePath)
    }

    async read(path: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
        return await fs.promises.readFile(path, { encoding: encoding })
    }

    async readDir(dirPath: string) {
        return fs.promises.readdir(dirPath)
    }

    async write(path: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
        return await fs.promises.writeFile(path, data, encoding)
    }

    async rename(oldPath: string, newPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.rename(oldPath, newPath, (err: any) => {
                if (err) reject(err)
                else resolve()
            })
        })
    }

    async copy(src: string, dest: string) {
        await fsExtra.copy(src, dest)
    }

    private getTrashDir(): string {
        return path.join(app.getPath('userData'), 'trash')
    }

    private async ensureTrashDir() {
        await fs.promises.mkdir(this.getTrashDir(), { recursive: true })
    }

    async moveToTrash(paths: string[]): Promise<TrashMap[] | null> {
        await this.ensureTrashDir()
        const trashDir = this.getTrashDir()
        const movedFiles: TrashMap[] = []

        try {
            for (const p of paths) {
                const baseName = path.basename(p)
                const newName = `${this.trashId++}_${baseName}`
                const trashPath = path.join(trashDir, newName)

                await this.copy(p, trashPath)
                await this.deletePermanently(p)

                movedFiles.push({ originalPath: p, trashPath })
            }

            return movedFiles
        } catch (error) {
            console.error('[delete] Failed to move file to trash:', error)

            for (const { originalPath, trashPath } of movedFiles) {
                try {
                    await this.copy(trashPath, originalPath)
                    await this.deletePermanently(trashPath)
                } catch {
                    console.log(error)
                }
            }

            return null
        }
    }

    async restoreFromTrash(trashMap: TrashMap[] | null): Promise<boolean> {
        if (!trashMap) return false

        try {
            for (const { originalPath, trashPath } of trashMap) {
                await fsExtra.copy(trashPath, originalPath)
                await fs.promises.unlink(trashPath)
            }
        } catch (error) {
            console.error('[undo_delete] Failed to restore files from trash:', error)
            return false
        }

        return true
    }

    async cleanTrash(): Promise<void> {
        const trashDir = this.getTrashDir()

        try {
            const files = await fs.promises.readdir(trashDir)
            for (const file of files) {
                const filePath = path.join(trashDir, file)
                await fs.promises.rm(filePath, { recursive: true, force: true })
            }
        } catch (error) {
            console.error('[clearTrash] Failed to clear trash:', error)
        }
    }

    async deletePermanently(path: string) {
        await fs.promises.rm(path, { force: true, recursive: true })
    }

    async create(targetPath: string, directory: boolean): Promise<void> {
        try {
            if (directory) {
                await fs.promises.mkdir(targetPath, { recursive: true })
            } else {
                const dirName = path.dirname(targetPath)
                await fs.promises.mkdir(dirName, { recursive: true })
                const baseName = path.basename(targetPath)
                await fs.promises.writeFile(targetPath, baseName)
            }
        } catch (error) {
            console.error('[create] Failed to create:', error)
        }
    }

    getUniqueFileNames(existingNames: Set<string>, fileNames: string[]): string[] {
        const results: string[] = []
        const reg = /^(.*?)-(\d+)$/
    
        for (const fileName of fileNames) {
            const ext = path.extname(fileName)
            const nameWithoutExt = path.basename(fileName, ext)
            const baseName = nameWithoutExt.match(reg)?.[1] ?? nameWithoutExt
    
            if (!existingNames.has(fileName)) {
                results.push(fileName)
                existingNames.add(fileName)
                continue
            }
    
            for (let i = 1; ; i++) {
                const newFileName = `${baseName}-${i}${ext}`
                if (!existingNames.has(newFileName)) {
                    results.push(newFileName)
                    existingNames.add(newFileName)
                    break
                }
            }
        }
    
        return results
    }
}