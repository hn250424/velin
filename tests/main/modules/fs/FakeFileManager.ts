import IFileManager from "src/main/modules/contracts/IFileManager"
import path from 'path'
import TrashMap from "@shared/types/TrashMap"

export default class FakeFileManager implements IFileManager {
    private pathExists: Record<string, boolean> = {}
    private savedFiles: Record<string, string> = {}
    private trashFiles: Record<string, string> = {}
    private trashId = 0

    setPathExistence(path: string, exists: boolean) {
        this.pathExists[path] = exists
    }

    setFilecontent(path: string, data: string) {
        this.savedFiles[path] = data
    }

    async exists(path: string): Promise<boolean> {
        return this.pathExists[path] ?? false
    }

    getBasename(filePath: string): string {
        return path.basename(filePath)
    }

    async read(path: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
        if (!(path in this.savedFiles)) throw new Error(`File not found: ${path}`)
        return this.savedFiles[path]
    }

    async write(path: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
        this.savedFiles[path] = data
        this.pathExists[path] = true
    }

    async rename(oldPath: string, newPath: string): Promise<void> {
        if (!(oldPath in this.savedFiles)) {
            throw new Error(`Cannot rename: Source file not found: ${oldPath}`)
        }
        if (newPath in this.savedFiles) {
            throw new Error(`Cannot rename: Destination file already exists: ${newPath}`)
        }

        this.savedFiles[newPath] = this.savedFiles[oldPath]
        this.pathExists[newPath] = true

        delete this.savedFiles[oldPath]
        delete this.pathExists[oldPath]
    }

    async delete(paths: string[]): Promise<TrashMap[] | null> {
        const movedFiles: TrashMap[] = []

        try {
            for (const p of paths) {
                if (!(p in this.savedFiles)) {
                    throw new Error(`File to delete not found: ${p}`)
                }

                const baseName = path.basename(p)
                const newName = `${this.trashId++}_${baseName}`

                this.trashFiles[newName] = this.savedFiles[p]

                delete this.savedFiles[p]
                delete this.pathExists[p]

                const trashPath = path.join('/trash', newName)
                movedFiles.push({ originalPath: p, trashPath })
            }

            return movedFiles
        } catch (e) {
            return null
        }
    }

    async undo_delete(trashMap: TrashMap[] | null): Promise<boolean> {
        if (!trashMap) return false

        try {
            for (const { originalPath, trashPath } of trashMap) {
                const trashName = path.basename(trashPath)
                const data = this.trashFiles[trashName]
                if (!data) throw new Error(`Trash not found: ${trashName}`)

                this.savedFiles[originalPath] = data
                this.pathExists[originalPath] = true
                delete this.trashFiles[trashName]
            }
        } catch (error) {
            console.error('[Fake undo_delete] Failed:', error)
            return false
        }

        return true
    }

    async cleanTrash(): Promise<void> {
        this.trashFiles = {}
    }
}