import IFileManager from "src/main/modules/contracts/IFileManager"
import path from 'path'

export default class FakeFileManager implements IFileManager {
    private pathExists: Record<string, boolean> = {}
    private savedFiles: Record<string, string> = {}

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
}