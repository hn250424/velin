import TrashMap from "@shared/types/TrashMap"

export default interface IFileManager {
    exists(path: string): Promise<boolean>
    getBasename(filePath: string): string
    read(path: string, encoding?: BufferEncoding): Promise<string>
    readDir(dirPath: string): Promise<string[]>
    write(path: string, data: string, encoding?: BufferEncoding): Promise<void>
    rename(oldPath: string, newPath: string): Promise<void>
    copy(src: string, dest: string): Promise<void>
    moveToTrash(paths: string[]): Promise<TrashMap[] | null>
    restoreFromTrash(trashMap: TrashMap[] | null): Promise<boolean>
    cleanTrash(): Promise<void>
    deletePermanently(path: string): Promise<void>
}