import FileService from '@services/FileService'
import Response from '@shared/types/Response'
import TabData from '@shared/types/TabData'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../modules/core/FakeFileManager'
import fakeDialogService, {
    setFakeConfirmResult,
    setFakeOpenFileDialogResult,
    setFakeOpenDirectoryDialogResult,
    setFakeSaveDialogResult
} from '../modules/features/fakeDialogService'
import FakeTabSessionRepository from '../modules/features/FakeTabSessionRepository'
import FakeTreeRepository from '../modules/features/FakeTreeRepository'

const tabSessionPath = '/fake/path/tabSession.json'
let fakeFileManager: FakeFileManager
let fakeTabSessionRepository: FakeTabSessionRepository
let fakeTreeRepository: FakeTreeRepository
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
        fakeTreeRepository = new FakeTreeRepository()
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService, fakeTreeRepository)
    })

    test('should create a new tab with an incremented ID based on the existing session', async () => {
        // Given.        
        fakeFileManager.setPathExistence(tabSessionPath, true)
        await fakeTabSessionRepository.setTabSession([{ id: 5, filePath: 'file.md' }])

        // When.
        const id = await fileService.newTab()

        // Then.
        expect(id).toBe(6)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(2)
        expect(session[1].id).toBe(6)
    })
})

describe('FileService.openFile', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository()
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService, fakeTreeRepository)
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

        // When.
        const data = await fileService.openFile()

        // Then.
        expect(data.filePath).toBe('openPath')
        expect(data.content).toBe('content')
    })
})

describe('FileService.save', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository()
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService, fakeTreeRepository)
    })

    test('Save with empty filePath and cancel dialog', async () => {
        // Given.
        const data: TabData = { ...emptyFilePathData }

        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })

        // When.
        const result: TabData = await fileService.save(data, fakeMainWindow as any)

        // Then.
        expect(result.isModified).toBe(true)
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
        const response = await fileService.save(data, fakeMainWindow as any)

        // Then.
        expect(response.isModified).toBe(false)
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
        const response = await fileService.save(data, fakeMainWindow as any)

        // Then.
        expect(response.isModified).toBe(false)
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
        fakeTreeRepository = new FakeTreeRepository()
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService, fakeTreeRepository)
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
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.saveAs(data, fakeMainWindow as any)

        // Then.
        expect(response.isModified).toBe(false)
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
        fakeTreeRepository = new FakeTreeRepository()
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService, fakeTreeRepository)
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
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session[0].filePath).toBe('')
        expect(session[1].filePath).toBe(_dataArr[1].filePath)
        const file_2 = await fakeFileManager.read(_dataArr[2].filePath)
        expect(file_2).toBe(_dataArr[2].content)
        expect(response[2].isModified).toBe(false)
        const file_3 = await fakeFileManager.read(newFilePath)
        expect(file_3).toBe(_dataArr[3].content)
        expect(response[3].isModified).toBe(false)
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
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session[0].filePath).toBe('')
        expect(session[1].filePath).toBe(_dataArr[1].filePath)
        const file_2 = await fakeFileManager.read(_dataArr[2].filePath)
        expect(file_2).toBe(_dataArr[2].content)
        expect(response[2].isModified).toBe(false)
        expect(response[3].isModified).toBe(true)
        expect(session[3].filePath).toBe('')
        expect(spy).toHaveBeenCalledTimes(2)
    })
})

describe('FileService.closeTab', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository()
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService, fakeTreeRepository)
    })

    test('should write when closeTab if data is modified', async () => {
        // Given.
        const data = { ...defaultData }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response).toBe(true)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(0)
        const file = await fakeFileManager.read(data.filePath)
        expect(file).toBe(data.content)
    })

    test('should remove without saving if user cancels confirm on modified data', async () => {
        // Given.
        const data = { ...defaultData }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(false)
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response).toBe(true)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(0)
    })

    test('should save to new path and remove session when closing modified data', async () => {
        // Given.
        const data = { ...emptyFilePathData }
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
        expect(response).toBe(true)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(0)
        const file = await fakeFileManager.read(newFilePath)
        expect(file).toBe(data.content)
    })

    test('should remain in the program when save dialog is canceled during closeTab', async () => {
        // Given.
        const data = { ...emptyFilePathData }
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
        expect(response).toBe(false)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(1)
    })

    test('should just remove session when closeTab if data is not modified', async () => {
        // Given.
        const data = { ...defaultData }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        fakeTabSessionRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await fileService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response).toBe(true)
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session.length).toBe(0)
    })
})

describe('FileService.closeTabsExcept', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository()
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService, fakeTreeRepository)
    })

    test('should retain only selected tab and save others modified file', async () => {
        // Given.
        const allData = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        await fakeTabSessionRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')
        const exceptData: TabData = allData[1]

        // When.
        const response = await fileService.closeTabsExcept(exceptData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(3)
        expect(await fakeFileManager.read(newFilePath)).toBe(allData[3].content)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession.length).toBe(1)
        expect(tabSession[0].id).toBe(exceptData.id)
        expect(tabSession[0].filePath).toBe(exceptData.filePath)
    })

    test('should retain only the selected tab when user declines to save', async () => {
        // Given.
        const allData = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(false)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        await fakeTabSessionRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')
        const exceptData: TabData = allData[1]

        // When.
        const response = await fileService.closeTabsExcept(exceptData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(1)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession.length).toBe(1)
        expect(tabSession[0].id).toBe(exceptData.id)
        expect(tabSession[0].filePath).toBe(exceptData.filePath)
    })

    test('should keep selected tab and tabs with canceled save dialog after confirm', async () => {
        // Given.
        const allData = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        await fakeTabSessionRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        for (const { filePath } of allData) {
            fakeFileManager.setFilecontent(filePath, 'dummy')
        }
        const spy = vi.spyOn(fakeFileManager, 'write')
        const exceptData: TabData = allData[1]

        // When.
        const response = await fileService.closeTabsExcept(exceptData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(2)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession.length).toBe(2)
        expect(tabSession[0].id).toBe(exceptData.id)
        expect(tabSession[0].filePath).toBe(exceptData.filePath)
        expect(await fakeFileManager.read(allData[2].filePath)).toBe(allData[2].content)
    })
})

describe('FileService.closeTabsToRight', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository()
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService, fakeTreeRepository)
    })

    test('should retain only the tabs to the left of the reference tab and save modified files', async () => {
        // Given.
        const allData = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        await fakeTabSessionRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')
        const refData: TabData = allData[1]

        // When.
        const response = await fileService.closeTabsToRight(refData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(3)
        expect(await fakeFileManager.read(newFilePath)).toBe(allData[3].content)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession.length).toBe(2)
        expect(tabSession[tabSession.length - 1].id).toBe(refData.id)
        expect(tabSession[tabSession.length - 1].filePath).toBe(refData.filePath)
    })

    test('should retain only the tabs to the left of the reference tab when user decline to save', async () => {
        // Given.
        const allData = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(false)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        await fakeTabSessionRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')
        const refData: TabData = allData[1]

        // When.
        const response = await fileService.closeTabsToRight(refData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(1)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession.length).toBe(2)
        expect(tabSession[tabSession.length - 1].id).toBe(refData.id)
        expect(tabSession[tabSession.length - 1].filePath).toBe(refData.filePath)
    })

    test('should retain left tabs and right tabs if user cancels save dialog after confirming to save', async () => {
        // Given.
        const allData = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        await fakeTabSessionRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        for (const { filePath } of allData) {
            fakeFileManager.setFilecontent(filePath, 'dummy')
        }
        const spy = vi.spyOn(fakeFileManager, 'write')
        const refData: TabData = allData[1]

        // When.
        await fileService.closeTabsToRight(refData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(2)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession.length).toBe(3)
        expect(tabSession[tabSession.length - 1].id).toBe(allData[3].id)
        expect(tabSession[tabSession.length - 1].filePath).toBe(allData[3].filePath)
        expect(await fakeFileManager.read(allData[2].filePath)).toBe(allData[2].content)
    })
})

describe('FileService.closeAllTabs', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository()
        fileService = new FileService(fakeFileManager, fakeTabSessionRepository, fakeDialogService, fakeTreeRepository)
    })

    test('should close all tabs and save modified files', async () => {
        // Given.
        const data = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        await fakeTabSessionRepository.setTabSession(
            data.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        const response = await fileService.closeAllTabs(data, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(3)
        expect(await fakeFileManager.read(newFilePath)).toBe(data[3].content)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession.length).toBe(0)
    })

    test('should close all tabs when user declines to save', async () => {
        // Given.
        const data = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(false)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        await fakeTabSessionRepository.setTabSession(
            data.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        const response = await fileService.closeAllTabs(data, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(1)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession.length).toBe(0)
    })

    test('should retain tab if user confirms save but cancels save dialog', async () => {
        // Given.
        const data = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        await fakeTabSessionRepository.setTabSession(
            data.map(({ id, filePath }) => ({ id, filePath }))
        )
        for (const { filePath } of data) {
            fakeFileManager.setFilecontent(filePath, 'dummy')
        }
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        await fileService.closeAllTabs(data, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(2)
        const tabSession = await fakeTabSessionRepository.readTabSession()
        expect(tabSession.length).toBe(1)
        expect(await fakeFileManager.read(data[2].filePath)).toBe(data[2].content)
    })
})