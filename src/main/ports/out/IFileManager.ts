export default interface IFileManager {
    exists(path: string): Promise<boolean>
    getBasename(filePath: string): string
    read(path: string, encoding?: BufferEncoding): Promise<string>
    write(path: string, data: string, encoding?: BufferEncoding): Promise<void>
}