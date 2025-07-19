import Response from "@shared/types/Response"
import { BrowserWindow } from "electron"

export default interface ITreeService {
    rename(prePath: string, newName: string): Promise<string | null>
}