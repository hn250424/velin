import exit from '@services/exitService'
import TabEditorDto from '@shared/dto/TabEditorDto'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../modules/core/FakeFileManager'
import fakeDialogService, {
    setFakeConfirmResult,
    setFakeSaveDialogResult
} from '../modules/features/fakeDialogService'
import FakeTabSessionRepository from '../modules/features/FakeTabSessionRepository'

const tabSessionPath = '/fake/path/tabSession.json'
let fakeMainWindow: FakeMainWindow
let fakeFileManager: FakeFileManager
let fakeTabSessionRepository: FakeTabSessionRepository

const preFilePath = 'preFilePath'
const newFilePath = 'newFilePath'
const preFileName = 'preFileName'
const newFileName = 'newFileName'
const preFileContent = 'preFileContent'
const newFileContent = 'newFileContent'

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

describe('exitService.exit', () => {
    beforeEach(() => {
        fakeMainWindow = new FakeMainWindow()
        fakeFileManager = new FakeFileManager()
        fakeTabSessionRepository = new FakeTabSessionRepository(tabSessionPath, fakeFileManager)
    })

    test('test when user cancels confirm dialog', async () => {
        // Given.
        const copyedData = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(false)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        copyedData.forEach((data, i) => {
            fakeFileManager.setFilecontent(data.filePath, 'dummy')
        })
        await fakeTabSessionRepository.setTabSession(
            copyedData.map(({ id, filePath }) => ({ id, filePath }))
        )
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        await exit(copyedData, fakeMainWindow as any, fakeFileManager, fakeTabSessionRepository, fakeDialogService)

        // Then.
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session[0].filePath).toBe('')
        expect(session[1].filePath).toBe(copyedData[1].filePath)
        const file_2 = await fakeFileManager.read(copyedData[2].filePath)
        expect(file_2).not.toBe(copyedData[2].content)
        const file_3 = await fakeFileManager.read(copyedData[3].filePath)
        expect(file_3).not.toBe(copyedData[3].content)
        expect(spy).toHaveBeenCalledTimes(1)
        expect(fakeMainWindow.close).toHaveBeenCalled()
    })

    test('test when user confirm dialog and cancels open dialog', async () => {
        // Given.
        const copyedData = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        copyedData.forEach((data, i) => {
            fakeFileManager.setFilecontent(data.filePath, 'dummy')
        })
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        await exit(copyedData, fakeMainWindow as any, fakeFileManager, fakeTabSessionRepository, fakeDialogService)

        // Then.
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session[0].filePath).toBe('')
        expect(session[1].filePath).toBe(copyedData[1].filePath)
        const file_2 = await fakeFileManager.read(copyedData[2].filePath)
        expect(file_2).toBe(copyedData[2].content)
        const file_3 = await fakeFileManager.read(copyedData[3].filePath)
        expect(file_3).not.toBe(copyedData[3].content)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(fakeMainWindow.close).toHaveBeenCalled()
    })

    test('test when user confirm dialog and select file path', async () => {
        // Given.
        const copyedData = [...dataArr]
        fakeFileManager.setPathExistence(tabSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        copyedData.forEach((data, i) => {
            fakeFileManager.setFilecontent(data.filePath, 'dummy')
        })
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        await exit(copyedData, fakeMainWindow as any, fakeFileManager, fakeTabSessionRepository, fakeDialogService)

        // Then.
        const session = await fakeTabSessionRepository.readTabSession()
        expect(session[0].filePath).toBe('')
        expect(session[1].filePath).toBe(copyedData[1].filePath)
        const file_2 = await fakeFileManager.read(copyedData[2].filePath)
        expect(file_2).toBe(copyedData[2].content)
        expect(session[3].filePath).toBe(newFilePath)
        const file_3 = await fakeFileManager.read(newFilePath)
        expect(file_3).toBe(copyedData[3].content)
        expect(spy).toHaveBeenCalledTimes(3)
        expect(fakeMainWindow.close).toHaveBeenCalled()
    })
})