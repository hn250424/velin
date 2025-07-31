import * as path from 'path'

export function getUniqueFileNames(existingNames: Set<string>, fileNames: string[]): string[] {
    const results: string[] = []
    const reg = /^(.*?)-(\d+)$/

    for (const fileName of fileNames) {
        const ext = path.extname(fileName)
        const nameWithoutExt = path.basename(fileName, ext)
        const baseName = nameWithoutExt.match(reg)?.[1] ?? nameWithoutExt

        if (!existingNames.has(fileName)) {
            results.push(fileName)
            existingNames.add(fileName)
            continue
        }

        for (let i = 1; ; i++) {
            const newFileName = `${baseName}-${i}${ext}`
            if (!existingNames.has(newFileName)) {
                results.push(newFileName)
                existingNames.add(newFileName)
                break
            }
        }
    }

    return results
}