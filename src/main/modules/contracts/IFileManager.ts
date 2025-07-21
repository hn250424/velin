export default interface IFileManager {
    exists(path: string): Promise<boolean>
    getBasename(filePath: string): string
    read(path: string, encoding?: BufferEncoding): Promise<string>
    write(path: string, data: string, encoding?: BufferEncoding): Promise<void>
    rename(oldPath: string, newPath: string): Promise<void>
    delete(paths: string[]): Promise<boolean>
    cleanTrash(): Promise<void>
}