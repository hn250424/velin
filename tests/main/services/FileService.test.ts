import FileService from '@services/FileService'
import Response from '@shared/types/Response'
import { TabEditorDto, TabEditorsDto } from '@shared/dto/TabEditorDto'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../modules/fs/FakeFileManager'
import fakeDialogService, {
    setFakeConfirmResult,
    setFakeOpenFileDialogResult,
    setFakeOpenDirectoryDialogResult,
    setFakeSaveDialogResult
} from '../modules/ui/fakeDialogService'
import FakeTabRepository from '../modules/persistence/FakeTabRepository'
import FakeTreeRepository from '../modules/persistence/FakeTreeRepository'
import FakeTreeManager from '../modules/domains/FakeTreeManager'
import TreeDto from '@shared/dto/TreeDto'

const tabSessionPath = '/fake/path/tabSession.json'
const treeSessionPath = '/fake/path/treeSession.json'
let fakeFileManager: FakeFileManager
let fakeTabRepository: FakeTabRepository
let fakeTreeManager: FakeTreeManager
let fakeTreeRepository: FakeTreeRepository
let fileService: FileService
const fakeMainWindow = new FakeMainWindow()

const preFilePath = 'preFilePath'
const newFilePath = 'newFilePath'
const preFileName = 'preFileName'
const newFileName = 'newFileName'
const preFileContent = 'preFileContent'
const newFileContent = 'newFileContent'

const emptyFilePathData: TabEditorDto = {
    id: 0,
    isModified: true,
    filePath: '',
    fileName: preFileName,
    content: preFileContent
}

const defaultData: TabEditorDto = {
    id: 0,
    isModified: true,
    filePath: preFilePath,
    fileName: preFileName,
    content: preFileContent
}

const tabEidtorDto: TabEditorsDto = {
    activatedId: 1,
    data: [
        {
            id: 0,
            isModified: false,
            filePath: '',
            fileName: 'Untitled',
            content: ''
        },
        {
            id: 1,
            isModified: false,
            filePath: `${preFilePath}_1`,
            fileName: `${preFileName}_1`,
            content: `${preFileContent}_1`
        },
        {
            id: 2,
            isModified: true,
            filePath: `${preFilePath}_2`,
            fileName: `${preFileName}_2`,
            content: `${preFileContent}_2`
        },
        {
            id: 3,
            isModified: true,
            filePath: '',
            fileName: `${preFileName}_3`,
            content: `${preFileContent}_3`
        },
    ]
}

const treeDto: TreeDto = {
    path: '/project',
    name: 'project',
    indent: 0,
    directory: true,
    expanded: true,
    children: [
        {
            path: '/project/index.ts',
            name: 'index.ts',
            indent: 1,
            directory: false,
            expanded: false,
            children: null,
        },
        {
            path: '/project/src',
            name: 'src',
            indent: 1,
            directory: true,
            expanded: false,
            children: [
                {
                    path: '/project/src/main.ts',
                    name: 'main.ts',
                    indent: 2,
                    directory: false,
                    expanded: false,
                    children: null as null,
                },
            ],
        },
    ],
}

describe('FileService.newTab', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeManager = new FakeTreeManager(fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository, fakeTreeManager)
    })

    test('should create a new tab with an incremented ID based on the existing session', async () => {
        // Given.        
        fakeFileManager.setPathExistence(tabSessionPath, true)
        await fakeTabRepository.setTabSession({
            activatedId: -1,
            data: [{ id: 5, filePath: 'file.md' }]
        })

        // When.
        const id = await fileService.newTab()

        // Then.
        expect(id).toBe(6)
        const session = await fakeTabRepository.readTabSession()
        expect(session.data.length).toBe(2)
        expect(session.data[1].id).toBe(6)
    })
})

describe('FileService.openFile', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeManager = new FakeTreeManager(fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository, fakeTreeManager)
    })

    test('should return false when the open dialog is canceled', async () => {
        // Given.
        setFakeOpenFileDialogResult({ canceled: true, filePaths: [] })

        // When.
        const result = await fileService.openFile()

        // Then.
        expect(result).toBe(null)
    })

    test('should open a file and return its path and content', async () => {
        // Given.
        setFakeOpenFileDialogResult({ canceled: false, filePaths: ['openPath'] })
        fakeFileManager.setFilecontent('openPath', 'content')
        fakeTabRepository.setTabSession({
            activatedId: 0,
            data: [
                { id: 0, filePath: 'path1' },
                { id: 1, filePath: 'path2' },
            ]
        })

        // When.
        const data = await fileService.openFile()

        // Then.
        expect(data.filePath).toBe('openPath')
        expect(data.content).toBe('content')
        const session = await fakeTabRepository.readTabSession()
        expect(session.activatedId).toBe(2)
        expect(session.data.length).toBe(3)
        expect(session.data[2].filePath).toBe('openPath')
    })

    test('should return correct response when called with path arg', async () => {
        // Given.
        fakeFileManager.setFilecontent('testPath', 'testContent')
        fakeTabRepository.setTabSession({
            activatedId: 0,
            data: [
                { id: 0, filePath: 'path1' },
                { id: 1, filePath: 'path2' },
            ]
        })

        // When.
        const response = await fileService.openFile('testPath')

        // Then.
        expect(response.content).toBe('testContent')
        expect(response.id).toBe(2)
        const session = await fakeTabRepository.readTabSession()
        expect(session.activatedId).toBe(2)
        expect(session.data[2].filePath).toBe('testPath')
    })
})

describe('FileService.openDirectory', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeManager = new FakeTreeManager(fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager, fakeTreeManager)
        fileService = new FileService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository, fakeTreeManager)
    })

    test('should return correctly updated root tree without dto', async () => {
        // Given.
        const copyedDto = {...treeDto}
        fakeTreeManager.setTree(copyedDto)
        setFakeOpenDirectoryDialogResult({
            canceled: false,
            filePaths: ['/project']
        })

        // When.
        const response = await fileService.openDirectory()
        
        // Then.
        expect(response).toEqual(copyedDto)
        const session = await fakeTreeRepository.readTreeSession()
        expect(response.path).toEqual(session.path)
    })

    test('should return correctly updated children tree without dto', async () => {
        // Given.
        const copyedDto = {...treeDto}
        fakeTreeManager.setTree(copyedDto)
        fakeTreeRepository.setTreeSession(copyedDto)
        setFakeOpenDirectoryDialogResult({
            canceled: false,
            filePaths: ['/project/src']
        })

        // When.
        const response = await fileService.openDirectory()

        // Then.
        expect(response.path).toBe('/project/src')
        const session = await fakeTreeRepository.readTreeSession()
        expect(response.path).toBe(session.path)
    })

    test('should return the correctly updated root tree when opening the root dto', async () => {
        // Given.
        const copyedDto = {...treeDto}
        fakeTreeManager.setTree(copyedDto)

        // When.
        const response = await fileService.openDirectory(copyedDto)
        
        // Then.
        expect(response).toEqual(copyedDto)
        const session = await fakeTreeRepository.readTreeSession()
        expect(response.path).toEqual(session.path)
    })

    test('should return the correctly updated child tree and mark it as expanded when opening a child dto', async () => {
        // Given.
        const copyedDto = {...treeDto}
        fakeTreeManager.setTree(copyedDto)
        fakeTreeRepository.setTreeSession(copyedDto)

        // When.
        const response = await fileService.openDirectory(copyedDto.children[1])

        // Then.
        expect(response.path).toBe('/project/src')
        const session = await fakeTreeRepository.readTreeSession()
        expect(response.path).toBe(session.children[1].path)
        expect(session.children[1].expanded).toBe(true)
    })
})

describe('FileService.save', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeManager = new FakeTreeManager(fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository, fakeTreeManager)
    })

    test('Save with empty filePath and cancel dialog', async () => {
        // Given.
        const data: TabEditorDto = { ...emptyFilePathData }

        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })

        // When.
        const result: TabEditorDto = await fileService.save(data, fakeMainWindow as any)

        // Then.
        expect(result.isModified).toBe(true)
    })

    test('Save with empty filePath and confirmed dialog', async () => {
        // Given.
        const data: TabEditorDto = { ...emptyFilePathData }
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        fakeFileManager.setPathExistence(tabSessionPath, true)
        await fakeTabRepository.setTabSession({
            activatedId: 1,
            data: [
                { id: data.id, filePath: data.filePath }
            ]
        })

        // When.
        const response = await fileService.save(data, fakeMainWindow as any)

        // Then.
        expect(response.isModified).toBe(false)
        expect(await fakeFileManager.read(newFilePath)).toBe(data.content)
        const tabSession = await fakeTabRepository.readTabSession()
        expect(tabSession.data[0].id).toBe(0)
        expect(tabSession.data[0].filePath).toBe(newFilePath)
    })

    test('Save with filePath', async () => {
        // Given.
        const data = { ...defaultData }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        await fakeTabRepository.setTabSession({
            activatedId: 1,
            data: [
                { id: data.id, filePath: data.filePath }
            ]
        })

        // When.
        const response = await fileService.save(data, fakeMainWindow as any)

        // Then.
        expect(response.isModified).toBe(false)
        expect(await fakeFileManager.read(data.filePath)).toBe(data.content)
        const tabSession = await fakeTabRepository.readTabSession()
        expect(tabSession.data[0].id).toBe(0)
        expect(tabSession.data[0].filePath).toBe(data.filePath)
    })
})

describe('FileService.saveAs', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeManager = new FakeTreeManager(fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository, fakeTreeManager)
    })

    test('should return false when SaveDialog is canceled', async () => {
        // Given.
        const data = { ...defaultData }
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })

        // When.
        const response = await fileService.saveAs(data, fakeMainWindow as any)

        // Then.
        expect(response).toBe(null)
    })

    test('should save file and update tabSession when SaveDialog returns path', async () => {
        // Given.
        const data = { ...defaultData }
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        fakeFileManager.setPathExistence(tabSessionPath, true)
        await fakeTabRepository.setTabSession({
            activatedId: 1,
            data: [
                { id: data.id, filePath: data.filePath }
            ]
        })

        // When.
        const response = await fileService.saveAs(data, fakeMainWindow as any)

        // Then.
        expect(response.isModified).toBe(false)
        const savedFile = await fakeFileManager.read(newFilePath)
        expect(savedFile).toBe(data.content)
        const updatedTabSession = await fakeTabRepository.readTabSession()
        expect(updatedTabSession.data[updatedTabSession.data.length - 1].id).toBe(data.id + 1)
        expect(updatedTabSession.data[updatedTabSession.data.length - 1].filePath).toBe(newFilePath)
    })
})

describe('FileService.saveAll', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeManager = new FakeTreeManager(fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository, fakeTreeManager)
    })

    test('test all cases with confirmed dialog', async () => {
        // Given.
        const copyedDto = { ...tabEidtorDto }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        await fakeTabRepository.setTabSession({
            activatedId: copyedDto.activatedId,
            data: copyedDto.data.map(({ id, filePath }) => ({ id, filePath }))
        })
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        const response = await fileService.saveAll(copyedDto, fakeMainWindow as any)

        // Then.
        const session = await fakeTabRepository.readTabSession()
        expect(session.data[0].filePath).toBe('')
        expect(session.data[1].filePath).toBe(copyedDto.data[1].filePath)
        const file_2 = await fakeFileManager.read(copyedDto.data[2].filePath)
        expect(file_2).toBe(copyedDto.data[2].content)
        expect(response.data[2].isModified).toBe(false)
        const file_3 = await fakeFileManager.read(newFilePath)
        expect(file_3).toBe(copyedDto.data[3].content)
        expect(response.data[3].isModified).toBe(false)
        expect(session.data[3].filePath).toBe(newFilePath)
        expect(spy).toHaveBeenCalledTimes(3)
    })

    test('test all cases with cancel dialog', async () => {
        // Given.
        const copyedDto = { ...tabEidtorDto }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        await fakeTabRepository.setTabSession({
            activatedId: copyedDto.activatedId,
            data: copyedDto.data.map(({ id, filePath }) => ({ id, filePath }))
        })
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        const response = await fileService.saveAll(copyedDto, fakeMainWindow as any)

        // Then.
        const session = await fakeTabRepository.readTabSession()
        expect(session.data[0].filePath).toBe('')
        expect(session.data[1].filePath).toBe(copyedDto.data[1].filePath)
        const file_2 = await fakeFileManager.read(copyedDto.data[2].filePath)
        expect(file_2).toBe(copyedDto.data[2].content)
        expect(response.data[2].isModified).toBe(false)
        expect(response.data[3].isModified).toBe(true)
        expect(session.data[3].filePath).toBe('')
        expect(spy).toHaveBeenCalledTimes(2)
    })
})
