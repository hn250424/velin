import ITreeReposotory from '@contracts/ITreeRepository'
import TreeNode from '@shared/types/TreeNode'
import fs from 'fs'
import path from 'path'

export default class TreeReposotory implements ITreeReposotory {

    constructor() {

    }

    /**
     * Gets the directory tree at the given path, scanning only one level deep.
     * 
     * @param dirPath - Directory path to scan
     * @returns TreeNode with immediate children, or null if not a directory.
     * 
     * Note:
     * - `children: null` means children are not loaded yet (lazy).
     * - `children: []` means no children exist or directory can't be read.
     */
    getDirectoryTree(dirPath: string, indent: number = 0) {
        const stats = fs.statSync(dirPath)
        if (!stats.isDirectory()) return null

        let children: TreeNode[] = []
        try {
            const dirents = fs.readdirSync(dirPath, { withFileTypes: true })

            dirents.sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory()) return -1
                if (!a.isDirectory() && b.isDirectory()) return 1
                return a.name.localeCompare(b.name)
            })

            children = dirents.map((dirent: fs.Dirent): TreeNode => ({
                path: path.join(dirPath, dirent.name),
                name: dirent.name,
                indent: indent + 1,
                directory: dirent.isDirectory(),
                expanded: false,
                children: null,
            }))
        } catch {
            children = []
        }

        return {
            path: dirPath,
            name: path.basename(dirPath),
            indent: indent + 1,
            directory: true,
            expanded: true,
            children,
        }
    }
}