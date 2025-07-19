import fs from 'fs'
import path from 'path'
import IFileManager from "src/main/modules/contracts/IFileManager"
import { injectable } from 'inversify'

@injectable()
export default class FileManager implements IFileManager {
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
}