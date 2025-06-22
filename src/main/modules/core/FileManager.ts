import fs from 'fs'
import path from 'path'
import IFileManager from "src/main/services/ports/IFileManager"
import { injectable } from 'inversify'

@injectable()
export default class FileManager implements IFileManager {
    constructor() {}

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

    async write(path: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
        return await fs.promises.writeFile(path, data, encoding)
    }
}