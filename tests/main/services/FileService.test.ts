import FileService from '@services/FileService'
import Response from '@shared/types/Response'
import TabData from '@shared/types/TabData'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../modules/core/FakeFileManager'
import fakeDialogService, {
    setFakeConfirmResult,
    setFakeOpenDialogResult,
    setFakeSaveDialogResult
} from '../modules/features/fakeDialogService'
import FakeTabSessionRepository from '../modules/features/FakeTabSessionRepository'

const tabSessionPath = '/fake/path/tabSession.json'
let fakeFileManager: FakeFileManager
let fakeTabSessionRepository: FakeTabSessionRepository
let fileService: FileService
const fakeMainWindow = new FakeMainWindow()

const preFilePath = 'preFilePath'
const newFilePath = 'newFilePath'
const preFileName = 'preFileName'
const newFileName = 'newFileName'
const preFileContent = 'preFileContent'
const newFileContent = 'newFileContent'

const emptyFilePathData: TabData = {
    id: 0,
    isModified: true,
    filePath: '',
    fileName: preFileName,
    content: preFileContent
}

const defaultData: TabData = {
    id: 0,
    isModified: true,
    filePath: preFilePath,
    fileName: preFileName,
    content: preFileContent
}

const dataArr: TabData[] = [
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

describe('FileService.newTab', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService)
    })

    test('should create a new tab with an incremented ID based on the existing session', async () => {
        // Given.        
        fakeFileManager.setPathExistence(tabSessionPath, true)
        await fakeTabSessionRepository.setTabSession([{ id: 5, filePath: 'file.md' }])

        // When.
        const result = await fileService.newTab()

        // Then.
        expect(result.result).toBe(true)
        expect(result.data).toBe(6)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(2)
        expect(session[1].id).toBe(6)
    })
})

describe('FileService.open', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService)
    })

    test('should return false when the open dialog is canceled', async () => {
        // Given.
        setFakeOpenDialogResult({ canceled: true, filePaths: [] })

        // When.
        const result = await fileService.open()

        // Then.
        expect(result.result).toBe(false)
    })

    test('should open a file and return its path and content', async () => {
        // Given.
        setFakeOpenDialogResult({ canceled: false, filePaths: ['openPath'] })
        fakeFileManager.setFilecontent('openPath', 'content')

        // When.
        const result = await fileService.open()

        // Then.
        expect(result.result).toBe(true)
        expect(result.data.filePath).toBe('openPath')
        expect(result.data.content).toBe('content')
    })
})

describe('FileService.save', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService)
    })

    test('Save with empty filePath and cancel dialog', async () => {
        // Given.
        const data: TabData = { ...emptyFilePathData }

        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })

        // When.
        const response: Response<TabData> = await fileService.save(data, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(false)
    })

    test('Save with empty filePath and confirmed dialog', async () => {
        // Given.
        const data: TabData = { ...emptyFilePathData }

        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        fakeFileManager.setPathExistence(tabSessionPath, true)
        await fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response: Response<TabData> = await fileService.save(data, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(true)
        expect(await fakeFileManager.read(newFilePath)).toBe(data.content)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession[0].id).toBe(0)
        expect(tabSession[0].filePath).toBe(newFilePath)
    })

    test('Save with filePath', async () => {
        // Given.
        const data = { ...defaultData }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        await fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response: Response<TabData> = await fileService.save(data, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(true)
        expect(await fakeFileManager.read(data.filePath)).toBe(data.content)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession[0].id).toBe(0)
        expect(tabSession[0].filePath).toBe(data.filePath)
    })
})

describe('FileService.saveAs', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService)
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
        expect(response.result).toBe(false)
    })

    test('should save file and update tabSession when SaveDialog returns path', async () => {
        // Given.
        const data = { ...defaultData }
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        fakeFileManager.setPathExistence(tabSessionPath, true)
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.saveAs(data, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(true)
        const savedFile = await fakeFileManager.read(newFilePath)
        expect(savedFile).toBe(data.content)
        const updatedTabSession = await fakeTabSessionRepository.readTabSession()
        expect(updatedTabSession[updatedTabSession.length - 1].id).toBe(data.id + 1)
        expect(updatedTabSession[updatedTabSession.length - 1].filePath).toBe(newFilePath)
    })
})

describe('FileService.saveAll', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService)
    })

    test('test all cases with confirmed dialog', async () => {
        // Given.
        const _dataArr = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        await fakeTabSessionRepository.setTabSession(
            _dataArr.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        const response = await fileService.saveAll(_dataArr, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(true)
        const responseDataArr = response.data
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session[0].filePath).toBe('')
        expect(session[1].filePath).toBe(_dataArr[1].filePath)
        const file_2 = await fakeFileManager.read(_dataArr[2].filePath)
        expect(file_2).toBe(_dataArr[2].content)
        expect(responseDataArr[2].isModified).toBe(false)
        const file_3 = await fakeFileManager.read(newFilePath)
        expect(file_3).toBe(_dataArr[3].content)
        expect(responseDataArr[3].isModified).toBe(false)
        expect(session[3].filePath).toBe(newFilePath)
        expect(spy).toHaveBeenCalledTimes(3)
    })

    test('test all cases with cancel dialog', async () => {
        // Given.
        const _dataArr = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        await fakeTabSessionRepository.setTabSession(
            _dataArr.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        const response = await fileService.saveAll(_dataArr, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(true)
        const responseDataArr = response.data
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session[0].filePath).toBe('')
        expect(session[1].filePath).toBe(_dataArr[1].filePath)
        const file_2 = await fakeFileManager.read(_dataArr[2].filePath)
        expect(file_2).toBe(_dataArr[2].content)
        expect(responseDataArr[2].isModified).toBe(false)
        expect(responseDataArr[3].isModified).toBe(true)
        expect(session[3].filePath).toBe('')
        expect(spy).toHaveBeenCalledTimes(2)
    })
})

describe('FileService.closeTab', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService)
    })

    test('should write when closeTab if data is modified', async () => {
        // Given.
        const data = {...defaultData}
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(true)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(0)
        const file = await fakeFileManager.read(data.filePath)
        expect(file).toBe(data.content)
    })

    test('should remove without saving if user cancels confirm on modified data', async () => {
        // Given.
        const data = {...defaultData}
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(false)
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(true)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(0)
    })

    test('should save to new path and remove session when closing modified data', async () => {
        // Given.
        const data = {...emptyFilePathData}
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(true)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(0)
        const file = await fakeFileManager.read(newFilePath)
        expect(file).toBe(data.content)
    })

    test('should remain in the program when save dialog is canceled during closeTab', async () => {
        // Given.
        const data = {...emptyFilePathData}
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(false)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(1)
    })

    test('should just remove session when closeTab if data is not modified', async () => {
        // Given.
        const data = {...defaultData}
        fakeFileManager.setPathExistence(tabSessionPath, true)
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response.result).toBe(true)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(0)
    })
})