import path from 'path'
import { beforeEach, describe, expect, test } from 'vitest'
import TreeService from '@services/TreeService'
import { TREE_SESSION_PATH, TEMP_TRASH } from 'src/main/constants/file_info'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../modules/fs/FakeFileManager'
import FakeTabRepository from '../modules/persistence/FakeTabRepository'
import FakeTreeRepository from '../modules/persistence/FakeTreeRepository'
import FakeTreeManager from '../modules/managers/FakeTreeManager'
import FakeTabManager from '../modules/managers/FakeTabManager'
import { TabSessionModel } from 'src/main/models/TabSessionModel'
import TreeSessionModel from '@main/models/TreeSessionModel'
import IFileManager from '@main/modules/contracts/IFileManager'
import TreeDto from '@shared/dto/TreeDto'

const tabSessionPath = '/fake/path/tabSession.json'
const treeSessionPath = '/fake/path/treeSession.json'

let fakeFileManager: FakeFileManager
let fakeTreeMnager: FakeTreeManager
let fakeTabRepository: FakeTabRepository
let fakeTreeRepository: FakeTreeRepository
let treeService: TreeService
const fakeMainWindow = new FakeMainWindow()

const treeSessionModel: TreeSessionModel = {
    "path": "D:\\node-workspace\\velin\\test_file",
    "name": "test_file",
    "indent": 0,
    "directory": true,
    "expanded": true,
    "children": [
        {
            "path": "D:\\node-workspace\\velin\\test_file\\dir333",
            "name": "dir333",
            "indent": 1,
            "directory": true,
            "expanded": true,
            "children": [
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\deep",
                    "name": "deep",
                    "indent": 2,
                    "directory": true,
                    "expanded": true,
                    "children": [
                        {
                            "path": "D:\\node-workspace\\velin\\test_file\\dir333\\deep\\14.md",
                            "name": "14.md",
                            "indent": 3,
                            "directory": false,
                            "expanded": false,
                            "children": null
                        },
                        {
                            "path": "D:\\node-workspace\\velin\\test_file\\dir333\\deep\\15.md",
                            "name": "15.md",
                            "indent": 3,
                            "directory": false,
                            "expanded": false,
                            "children": null
                        }
                    ]
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\1354.md",
                    "name": "1354.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\1355.md",
                    "name": "1355.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\1356.md",
                    "name": "1356.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\1357.md",
                    "name": "1357.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\16.md",
                    "name": "16.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                }
            ]
        },
        {
            "path": "D:\\node-workspace\\velin\\test_file\\direc.md",
            "name": "direc.md",
            "indent": 1,
            "directory": false,
            "expanded": false,
            "children": null
        },
        {
            "path": "D:\\node-workspace\\velin\\test_file\\test138.md",
            "name": "test138.md",
            "indent": 1,
            "directory": false,
            "expanded": false,
            "children": null
        },
        {
            "path": "D:\\node-workspace\\velin\\test_file\\test139.md",
            "name": "test139.md",
            "indent": 1,
            "directory": false,
            "expanded": false,
            "children": null
        }
    ]
}

const treeDto: TreeDto = {
    "path": "D:\\node-workspace\\velin\\test_file",
    "name": "test_file",
    "indent": 0,
    "directory": true,
    "expanded": true,
    "children": [
        {
            "path": "D:\\node-workspace\\velin\\test_file\\dir333",
            "name": "dir333",
            "indent": 1,
            "directory": true,
            "expanded": true,
            "children": [
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\deep",
                    "name": "deep",
                    "indent": 2,
                    "directory": true,
                    "expanded": true,
                    "children": [
                        {
                            "path": "D:\\node-workspace\\velin\\test_file\\dir333\\deep\\14.md",
                            "name": "14.md",
                            "indent": 3,
                            "directory": false,
                            "expanded": false,
                            "children": null
                        },
                        {
                            "path": "D:\\node-workspace\\velin\\test_file\\dir333\\deep\\15.md",
                            "name": "15.md",
                            "indent": 3,
                            "directory": false,
                            "expanded": false,
                            "children": null
                        }
                    ]
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\1354.md",
                    "name": "1354.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\1355.md",
                    "name": "1355.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\1356.md",
                    "name": "1356.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\1357.md",
                    "name": "1357.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                },
                {
                    "path": "D:\\node-workspace\\velin\\test_file\\dir333\\16.md",
                    "name": "16.md",
                    "indent": 2,
                    "directory": false,
                    "expanded": false,
                    "children": null
                }
            ]
        },
        {
            "path": "D:\\node-workspace\\velin\\test_file\\direc.md",
            "name": "direc.md",
            "indent": 1,
            "directory": false,
            "expanded": false,
            "children": null
        },
        {
            "path": "D:\\node-workspace\\velin\\test_file\\test138.md",
            "name": "test138.md",
            "indent": 1,
            "directory": false,
            "expanded": false,
            "children": null
        },
        {
            "path": "D:\\node-workspace\\velin\\test_file\\test139.md",
            "name": "test139.md",
            "indent": 1,
            "directory": false,
            "expanded": false,
            "children": null
        }
    ]
}

function traverse(node: TreeSessionModel | TreeDto, cb: (node: TreeSessionModel | TreeDto) => void) {
    cb(node)
    for (const child of node.children ?? []) {
        traverse(child, cb)
    }
}

function deepCopyTreeDto(dto: TreeDto): TreeDto {
    return {
        ...dto,
        children: dto.children ? dto.children.map(child => deepCopyTreeDto(child)) : []
    }
}

describe('treeService.rename', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTreeMnager = new FakeTreeManager(fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        treeService = new TreeService(fakeFileManager, fakeTreeMnager, fakeTreeRepository)
    })

    test('should sync renamed session including children nodes', async () => {
        // Given.
        const copiedTreeSessionModel = { ...treeSessionModel }
        traverse(copiedTreeSessionModel, (model) => {
            fakeFileManager.setPathExistence(model.path, true)
            fakeFileManager.setFilecontent(model.path, model.name)
        })
        await fakeTreeRepository.setTreeSession(copiedTreeSessionModel)
        const oldRoot = copiedTreeSessionModel.path
        const newRoot = 'src/fake/new'

        // When.
        await treeService.rename(oldRoot, newRoot)

        // Then.
        const session = await fakeTreeRepository.readTreeSession()
        expect(path.normalize(session.path)).toBe(path.normalize(newRoot))
        const checkPaths = (model: TreeSessionModel) => {
            expect(path.normalize(model.path).startsWith(path.normalize(newRoot))).toBe(true)
            for (const child of model.children ?? []) {
                checkPaths(child)
            }
        }
        checkPaths(session)
    })
})

describe('treeService.paste', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTreeMnager = new FakeTreeManager(fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        treeService = new TreeService(fakeFileManager, fakeTreeMnager, fakeTreeRepository)
    })

    test('should delete original file and copy to new path when clipboardMode is cut', async () => {
        // Given.
        const copiedTreeDto = deepCopyTreeDto(treeDto)
        traverse(copiedTreeDto, (dto) => {
            fakeFileManager.setPathExistence(dto.path, true)
            fakeFileManager.setFilecontent(dto.path, dto.name)
        })
        const target = copiedTreeDto
        const childrenToPaste = copiedTreeDto.children[0].children[0].children // Directory deep.
        const originalPaths = childrenToPaste.map(c => c.path) // For checking delete with cut mode.

        // When.
        const result = await treeService.paste(target, childrenToPaste, 'cut')

        // Then.
        expect(result).toBe(true)

        for (const oldPath of originalPaths) {
            const exists = await fakeFileManager.exists(oldPath)
            expect(exists).toBe(false)
        }

        for (const pasted of childrenToPaste) {
            const exists = await fakeFileManager.exists(pasted.path)
            expect(exists).toBe(true)

            const content = await fakeFileManager.read(pasted.path)
            expect(content).toBe(pasted.name)

            expect(pasted.indent).toBe(target.indent + 1)
        }
    })

    test('should rollback all copied files when one fails', async () => {
        // Given
        const copiedTreeDto = { ...treeDto }
        traverse(copiedTreeDto, (dto) => {
            fakeFileManager.setPathExistence(dto.path, true)
            fakeFileManager.setFilecontent(dto.path, dto.name)
        })

        const originalCopy = fakeFileManager.copy.bind(fakeFileManager)
        const failPath = path.join(copiedTreeDto.path, copiedTreeDto.children[0].children[0].children[0].name)
        fakeFileManager.copy = async (src: string, dest: string) => {
            if (dest === failPath) {
                throw new Error('Copy failed')
            }
            return originalCopy(src, dest)
        }

        const target = copiedTreeDto
        const childrenToPaste = copiedTreeDto.children[0].children[0].children // Directory deep.
        const originalPaths = childrenToPaste.map(c => c.path) // For checking delete with cut mode.

        // When
        const result = await treeService.paste(target, childrenToPaste, 'cut')

        // Then
        expect(result).toBe(false)
        for (const oldPath of originalPaths) {
            const exists = await fakeFileManager.exists(oldPath)
            expect(exists).toBe(true)
        }
        for (const pasted of childrenToPaste) {
            const pastedPath = path.join(target.path, pasted.name)
            const exists = await fakeFileManager.exists(pastedPath)
            expect(exists).toBe(false)
        }
    })

    test('should copy files to new path without deleting original when clipboardMode is copy', async () => {
        // Given.
        const copiedTreeDto = deepCopyTreeDto(treeDto)
        traverse(copiedTreeDto, (dto) => {
            fakeFileManager.setPathExistence(dto.path, true)
            fakeFileManager.setFilecontent(dto.path, dto.name)
        })
        const target = copiedTreeDto
        const childrenToPaste = copiedTreeDto.children[0].children[0].children // Directory deep.
        const originalPaths = childrenToPaste.map(c => c.path) // For checking original still exists.

        // When.
        const result = await treeService.paste(target, childrenToPaste, 'copy')

        // Then.
        expect(result).toBe(true)

        for (const oldPath of originalPaths) {
            const exists = await fakeFileManager.exists(oldPath)
            expect(exists).toBe(true)
        }

        for (const pasted of childrenToPaste) {
            const exists = await fakeFileManager.exists(pasted.path)
            expect(exists).toBe(true)

            const content = await fakeFileManager.read(pasted.path)
            expect(content).toBe(pasted.name)

            expect(pasted.indent).toBe(target.indent + 1)
        }
    })

    test('should rollback all copied files when one copy fails in copy mode', async () => {
        // Given
        const copiedTreeDto = deepCopyTreeDto(treeDto)
        traverse(copiedTreeDto, (dto) => {
            fakeFileManager.setPathExistence(dto.path, true)
            fakeFileManager.setFilecontent(dto.path, dto.name)
        })

        const originalCopy = fakeFileManager.copy.bind(fakeFileManager)
        const failPath = path.join(copiedTreeDto.path, copiedTreeDto.children[0].children[0].children[0].name)
        fakeFileManager.copy = async (src: string, dest: string) => {
            if (dest === failPath) {
                throw new Error('Copy failed')
            }
            return originalCopy(src, dest)
        }

        const target = copiedTreeDto
        const childrenToPaste = copiedTreeDto.children[0].children[0].children
        const originalPaths = childrenToPaste.map(c => c.path)

        // When
        const result = await treeService.paste(target, childrenToPaste, 'copy')

        // Then
        expect(result).toBe(false)
        for (const oldPath of originalPaths) {
            const exists = await fakeFileManager.exists(oldPath)
            expect(exists).toBe(true)
        }
        for (const pasted of childrenToPaste) {
            const pastedPath = path.join(target.path, pasted.name)
            const exists = await fakeFileManager.exists(pastedPath)
            expect(exists).toBe(false)
        }
    })
})


describe('treeService.syncTreeSessionFromRenderer', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTreeMnager = new FakeTreeManager(fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        treeService = new TreeService(fakeFileManager, fakeTreeMnager, fakeTreeRepository)
    })

    test('a write session was received from the renderer for synchronization', async () => {
        // Given.
        const copiedDto = deepCopyTreeDto(treeDto)

        // When.
        await treeService.syncTreeSessionFromRenderer(copiedDto)

        // Then.
        const session: TreeSessionModel = await fakeTreeRepository.readTreeSession()

        const dtoPaths: string[] = []
        traverse(copiedDto, node => dtoPaths.push(path.normalize(node.path)))

        const sessionPaths: string[] = []
        traverse(session, node => sessionPaths.push(path.normalize(node.path)))

        expect(sessionPaths).toEqual(dtoPaths)
    })
})

describe('treeService.getSyncedTreeSession', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTreeMnager = new FakeTreeManager(fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        treeService = new TreeService(fakeFileManager, fakeTreeMnager, fakeTreeRepository)
    })

    test('should sync with file system and update tree session', async () => {
        // Given.
        const copiedModel = deepCopyTreeDto(treeSessionModel)
        await fakeTreeRepository.setTreeSession(copiedModel)
        traverse(copiedModel, (model) => {
            fakeFileManager.setPathExistence(model.path, true)
            fakeFileManager.setFilecontent(model.path, model.name)
        })
        const newFilePath = path.join(copiedModel.path, 'newFilePath')
        const newFileData = 'newFileData'
        fakeFileManager.setPathExistence(newFilePath, true)
        fakeFileManager.setFilecontent(newFilePath, newFileData)
        copiedModel.children.push({
            path: newFilePath,
            name: 'newFilePath',
            indent: 1,
            directory: false,
            expanded: false,
            children: null,
        })
        fakeTreeMnager.setTree(copiedModel)

        // // When.
        await treeService.getSyncedTreeSession()

        // // Then.
        const session = await fakeTreeRepository.readTreeSession()
        const hasNewFile = session.children?.some(child => child.path === newFilePath)
        expect(hasNewFile).toBe(true)
    })

    test('should sync with file system and remove deleted file from tree session', async () => {
        // Given.
        const copiedModel = deepCopyTreeDto(treeSessionModel)
        const removedFilePath = copiedModel.children?.[0]?.path
        if (copiedModel.children && removedFilePath) {
            copiedModel.children = copiedModel.children.filter(child => child.path !== removedFilePath)
        }
        await fakeTreeRepository.setTreeSession(copiedModel)
        traverse(copiedModel, (model) => {
            fakeFileManager.setPathExistence(model.path, true)
            fakeFileManager.setFilecontent(model.path, model.name)
        })
        if (removedFilePath) {
            fakeFileManager.setPathExistence(removedFilePath, false)
        }
        fakeTreeMnager.setTree(copiedModel)

        // When.
        await treeService.getSyncedTreeSession()

        // Then.
        const session = await fakeTreeRepository.readTreeSession()
        const hasRemovedFile = session.children?.some(child => child.path === removedFilePath)
        expect(hasRemovedFile).toBe(false)
    })
})
