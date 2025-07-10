import Response from '@shared/types/Response'
import TabEditorDto from '@shared/dto/TabEditorDto'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../adapters/out/fs/FakeFileManager'
import fakeDialogService, {
    setFakeConfirmResult,
    setFakeOpenFileDialogResult,
    setFakeOpenDirectoryDialogResult,
    setFakeSaveDialogResult
} from '../adapters/out/ui/fakeDialogService'
import FakeTabRepository from '../adapters/out/persistence/FakeTabRepository'
import FakeTreeRepository from '../adapters/out/persistence/FakeTreeRepository'
import TabService from '@services/TabService'

const tabSessionPath = '/fake/path/tabSession.json'
const treeSessionPath = '/fake/path/treeSession.json'
let fakeFileManager: FakeFileManager
let fakeTabRepository: FakeTabRepository
let fakeTreeRepository: FakeTreeRepository
let tabService: TabService
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

const dataArr: TabEditorDto[] = [
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

describe('tabService.closeTab', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        tabService = new TabService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository)
    })

    test('should write when closeTab if data is modified', async () => {
        // Given.
        const data = { ...defaultData }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        fakeTabRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await tabService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response).toBe(true)
        const session = await fakeTabRepository.readTabSession()
        expect(session.length).toBe(0)
        const file = await fakeFileManager.read(data.filePath)
        expect(file).toBe(data.content)
    })

    test('should remove without saving if user cancels confirm on modified data', async () => {
        // Given.
        const data = { ...defaultData }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(false)
        fakeTabRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await tabService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response).toBe(true)
        const session = await fakeTabRepository.readTabSession()
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
        fakeTabRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await tabService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response).toBe(true)
        const session = await fakeTabRepository.readTabSession()
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
        fakeTabRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await tabService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response).toBe(false)
        const session = await fakeTabRepository.readTabSession()
        expect(session.length).toBe(1)
    })

    test('should just remove session when closeTab if data is not modified', async () => {
        // Given.
        const data = { ...defaultData }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        fakeTabRepository.setTabSession([{ id: data.id, filePath: data.filePath }])

        // When.
        const response = await tabService.closeTab(data, fakeMainWindow as any)

        // Then.
        expect(response).toBe(true)
        const session = await fakeTabRepository.readTabSession()
        expect(session.length).toBe(0)
    })
})

describe('tabService.closeTabsExcept', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        tabService = new TabService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository)
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
        await fakeTabRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')
        const exceptData: TabEditorDto = allData[1]

        // When.
        const response = await tabService.closeTabsExcept(exceptData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(3)
        expect(await fakeFileManager.read(newFilePath)).toBe(allData[3].content)
        const tabSession = await fakeTabRepository.readTabSession()
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
        await fakeTabRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')
        const exceptData: TabEditorDto = allData[1]

        // When.
        const response = await tabService.closeTabsExcept(exceptData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(1)
        const tabSession = await fakeTabRepository.readTabSession()
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
        await fakeTabRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        for (const { filePath } of allData) {
            fakeFileManager.setFilecontent(filePath, 'dummy')
        }
        const spy = vi.spyOn(fakeFileManager, 'write')
        const exceptData: TabEditorDto = allData[1]

        // When.
        const response = await tabService.closeTabsExcept(exceptData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(2)
        const tabSession = await fakeTabRepository.readTabSession()
        expect(tabSession.length).toBe(2)
        expect(tabSession[0].id).toBe(exceptData.id)
        expect(tabSession[0].filePath).toBe(exceptData.filePath)
        expect(await fakeFileManager.read(allData[2].filePath)).toBe(allData[2].content)
    })
})

describe('tabService.closeTabsToRight', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        tabService = new TabService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository)
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
        await fakeTabRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')
        const refData: TabEditorDto = allData[1]

        // When.
        const response = await tabService.closeTabsToRight(refData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(3)
        expect(await fakeFileManager.read(newFilePath)).toBe(allData[3].content)
        const tabSession = await fakeTabRepository.readTabSession()
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
        await fakeTabRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')
        const refData: TabEditorDto = allData[1]

        // When.
        const response = await tabService.closeTabsToRight(refData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(1)
        const tabSession = await fakeTabRepository.readTabSession()
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
        await fakeTabRepository.setTabSession(
            allData.map(({ id, filePath }) => ({ id, filePath }))
        )
        for (const { filePath } of allData) {
            fakeFileManager.setFilecontent(filePath, 'dummy')
        }
        const spy = vi.spyOn(fakeFileManager, 'write')
        const refData: TabEditorDto = allData[1]

        // When.
        await tabService.closeTabsToRight(refData, allData, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(2)
        const tabSession = await fakeTabRepository.readTabSession()
        expect(tabSession.length).toBe(3)
        expect(tabSession[tabSession.length - 1].id).toBe(allData[3].id)
        expect(tabSession[tabSession.length - 1].filePath).toBe(allData[3].filePath)
        expect(await fakeFileManager.read(allData[2].filePath)).toBe(allData[2].content)
    })
})

describe('tabService.closeAllTabs', () => {
    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        tabService = new TabService(fakeFileManager, fakeTabRepository, fakeDialogService, fakeTreeRepository)
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
        await fakeTabRepository.setTabSession(
            data.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        const response = await tabService.closeAllTabs(data, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(3)
        expect(await fakeFileManager.read(newFilePath)).toBe(data[3].content)
        const tabSession = await fakeTabRepository.readTabSession()
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
        await fakeTabRepository.setTabSession(
            data.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        const response = await tabService.closeAllTabs(data, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(1)
        const tabSession = await fakeTabRepository.readTabSession()
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
        await fakeTabRepository.setTabSession(
            data.map(({ id, filePath }) => ({ id, filePath }))
        )
        for (const { filePath } of data) {
            fakeFileManager.setFilecontent(filePath, 'dummy')
        }
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        await tabService.closeAllTabs(data, fakeMainWindow as any)

        // Then.
        expect(spy).toHaveBeenCalledTimes(2)
        const tabSession = await fakeTabRepository.readTabSession()
        expect(tabSession.length).toBe(1)
        expect(await fakeFileManager.read(data[2].filePath)).toBe(data[2].content)
    })
})