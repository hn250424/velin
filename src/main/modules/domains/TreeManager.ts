import ITreeManager from '@modules_contracts/ITreeManager'
import TreeDto from '@shared/dto/TreeDto'
import fs from 'fs'
import path from 'path'
import TreeSessionModel from '@main/models/TreeSessionModel'
import { inject, injectable } from 'inversify'
import DI_KEYS from '../../constants/di_keys'
import IFileManager from '../contracts/IFileManager'

@injectable()
export default class TreeManager implements ITreeManager {

    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
    ) { }

    /**
     * Gets the directory tree at the given path, scanning only one level deep.
     * 
     * @param dirPath - Directory path to scan
     * @returns TreeNode with immediate children, or null if not a directory.
     * 
     * Note:
     * - children: null means children are not loaded yet (lazy).
     * - children: [] means no children exist or directory can't be read.
     */
    async getDirectoryTree(dirPath: string, indent: number = 0) {
        const stats = fs.statSync(dirPath)
        if (!stats.isDirectory()) return null

        let children: TreeDto[] | null = null

        try {
            const dirents = fs.readdirSync(dirPath, { withFileTypes: true })

            dirents.sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory()) return -1
                if (!a.isDirectory() && b.isDirectory()) return 1
                return a.name.localeCompare(b.name)
            })

            children = dirents.map((dirent: fs.Dirent): TreeDto => ({
                path: path.join(dirPath, dirent.name),
                name: dirent.name,
                indent: indent + 1,
                directory: dirent.isDirectory(),
                expanded: false,
                children: null,
            }))
        } catch {
            children = null
        }

        return {
            path: dirPath,
            name: path.basename(dirPath),
            indent: indent,
            directory: true,
            expanded: true,
            children,
        }
    }

    async getSessionModelWithFs(
        dirPath: string,
        indent: number,
        fsChildren: TreeDto[] | null,
        preTree: TreeSessionModel
    ): Promise<TreeSessionModel | null> {
        if (!preTree) {
            const newTree: TreeSessionModel = {
                path: dirPath,
                name: path.basename(dirPath),
                indent,
                directory: true,
                expanded: true,
                children: fsChildren?.map(child => ({
                    ...child,
                    children: null as null
                })),
            }
            // await this.writeTreeSession(newTree)
            return newTree
        }

        const newNode: TreeSessionModel = {
            path: dirPath,
            name: path.basename(dirPath),
            indent,
            directory: true,
            expanded: true,
            children: fsChildren
        }

        const newTree = this.replaceNode(preTree, dirPath, newNode) || preTree
        return newTree
    }

    private replaceNode(root: TreeSessionModel, targetPath: string, newNode: TreeSessionModel): TreeSessionModel | null {
        if (root.path === targetPath) {
            return newNode
        }

        if (root.children) {
            const newChildren = root.children.map(child => {
                return this.replaceNode(child, targetPath, newNode)
            })

            return { ...root, children: newChildren }
        }

        return root
    }

    async syncWithFs(node: TreeDto): Promise<TreeDto | null> {
        const exists = await this.fileManager.exists(node.path)
        if (!exists) return null

        if (!node.directory) return node

        if (!node.expanded) {
            return {
                ...node,
                children: null
            }
        }

        const current = await this.getDirectoryTree(node.path, node.indent)
        const sessionChildren = node.children ?? []
        const sessionMap = new Map(sessionChildren.map((c) => [c.path, c]))

        const updatedChildren: TreeDto[] = []

        for (const child of current.children ?? []) {
            const sessionChild = sessionMap.get(child.path)
            const merged = await this.syncWithFs(sessionChild ?? child)
            if (merged) updatedChildren.push(merged)
        }

        return {
            ...node,
            expanded: node.expanded,
            children: updatedChildren.length > 0 ? updatedChildren : null,
        }
    }
}