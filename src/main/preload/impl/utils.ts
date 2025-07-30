import { webFrame } from "electron"
import * as path from 'path'
import { UtilsAPI } from "@shared/preload"

const utils: UtilsAPI = {
    setZoomFactor: (factor: number) => webFrame.setZoomFactor(factor),
    getDirName: (fullPath: string): string => path.dirname(fullPath),
    getBaseName: (fullPath: string): string => path.basename(fullPath),
    getJoinedPath: (dir: string, base: string): string => path.join(dir, base),
    getRelativePath: (from: string, to: string): string => path.relative(from, to),
    isAbsolute: (p: string): boolean => path.isAbsolute(p),
    pathSep: path.sep,
}

export default utils