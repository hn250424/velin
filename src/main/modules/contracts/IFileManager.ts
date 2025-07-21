import TrashMap from "@shared/types/TrashMap"

export default interface IFileManager {
    exists(path: string): Promise<boolean>
    getBasename(filePath: string): string
    read(path: string, encoding?: BufferEncoding): Promise<string>
    write(path: string, data: string, encoding?: BufferEncoding): Promise<void>
    rename(oldPath: string, newPath: string): Promise<void>
    delete(paths: string[]): Promise<TrashMap[] | null>
    undo_delete(trashMap: TrashMap[] | null): Promise<boolean>
    cleanTrash(): Promise<void>
}