import { loadedRenderer } from '@services/loadService'
import { TAB_SESSION_PATH } from 'src/main/constants/file_info'
import { beforeEach, describe, expect, test } from 'vitest'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../adapters/out/fs/FakeFileManager'
import FakeTabRepository from '../adapters/out/persistence/FakeTabRepository'

describe('loadService.loadedRenderer: ', () => {
    const tabSessionPath = '/fake/path/tabSession.json'

    let fakeMainWindow: FakeMainWindow
    let fakeFileManager: FakeFileManager
    let fakeTabRepository: FakeTabRepository

    beforeEach(() => {
        fakeMainWindow = new FakeMainWindow()
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
    })

    test('loadedRenderer: normal', async () => {
        // Given.
        fakeFileManager.setPathExistence(tabSessionPath, true)
        fakeFileManager.setPathExistence('file1.txt', true)
        fakeFileManager.setPathExistence('file2.txt', true)

        fakeFileManager.setFilecontent('file1.txt', 'test1')
        fakeFileManager.setFilecontent('file2.txt', 'test2')

        const initialSession = [
            { id: 0, filePath: 'file1.txt' },
            { id: 1, filePath: 'file2.txt' },
        ]
        fakeTabRepository.setTabSession(initialSession)

        // When.
        await loadedRenderer(fakeMainWindow as any, fakeFileManager, fakeTabRepository)

        // Then.
        expect(fakeMainWindow.webContents.send).toHaveBeenCalled()
        expect(fakeMainWindow.webContents.send.mock.calls[0][0]).toBe('tabSession')
        const sentData = fakeMainWindow.webContents.send.mock.calls[0][1]
        expect(Array.isArray(sentData)).toBe(true)
        expect(sentData.length).toBe(2)
        expect(sentData[0]).toEqual({
            id: 0,
            isModified: false,
            filePath: 'file1.txt',
            fileName: 'file1.txt',
            content: 'test1',
        })
        expect(sentData[1]).toEqual({
            id: 1,
            isModified: false,
            filePath: 'file2.txt',
            fileName: 'file2.txt',
            content: 'test2',
        })
    })

    test('loadedRenderer: tabSession json file does not exist', async () => {
        // Given.
        fakeFileManager.setPathExistence(TAB_SESSION_PATH, false)
        fakeTabRepository.setTabSession([])

        // When.
        await loadedRenderer(fakeMainWindow as any, fakeFileManager, fakeTabRepository)

        // Then.
        expect(fakeMainWindow.webContents.send).toHaveBeenCalled()
        expect(fakeMainWindow.webContents.send.mock.calls[0][0]).toBe('tabSession')
        const sentData = fakeMainWindow.webContents.send.mock.calls[0][1]
        expect(Array.isArray(sentData)).toBe(true)
        expect(sentData.length).toBe(0)
    })

    test('loadedRenderer: tabSession text does not exist(length === 0)', async () => {
        // Given.
        fakeFileManager.setPathExistence(TAB_SESSION_PATH, true)
        fakeTabRepository.setTabSession([])

        // When.
        await loadedRenderer(fakeMainWindow as any, fakeFileManager, fakeTabRepository)

        // Then.
        expect(fakeMainWindow.webContents.send).toHaveBeenCalled()
        expect(fakeMainWindow.webContents.send.mock.calls[0][0]).toBe('tabSession')
        const sentData = fakeMainWindow.webContents.send.mock.calls[0][1]
        expect(Array.isArray(sentData)).toBe(true)
        expect(sentData.length).toBe(0)
    })
})
