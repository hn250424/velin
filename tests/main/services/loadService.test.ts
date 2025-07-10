import { loadedRenderer } from '@services/loadService'
import { TAB_SESSION_PATH } from 'src/main/constants/file_info'
import { beforeEach, describe, expect, test } from 'vitest'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../adapters/out/fs/FakeFileManager'
import FakeTabRepository from '../adapters/out/persistence/FakeTabRepository'
import FakeTreeRepository from '../adapters/out/persistence/FakeTreeRepository'
import FakeTreeManager from '../adapters/out/persistence/FakeTreeManager'

describe('loadService.loadedRenderer: ', () => {
    const tabSessionPath = '/fake/path/tabSession.json'
    const treeSessionPath = '/fake/path/treeSession.json'

    let fakeMainWindow: FakeMainWindow
    let fakeFileManager: FakeFileManager
    let fakeTabRepository: FakeTabRepository
    let fakeTreeRepository: FakeTreeRepository
    let fakeTreeManager: FakeTreeManager

    beforeEach(() => {
        fakeMainWindow = new FakeMainWindow()
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        fakeTreeManager = new FakeTreeManager()
    })

    test('loadedRenderer: normal', async () => {
        // Given.
        const initialSession = [
            { id: 0, filePath: 'file1.txt' },
            { id: 1, filePath: 'file2.txt' },
        ]
        const initialTreeSession = {
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
                    expanded: true,
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

        fakeFileManager.setPathExistence(tabSessionPath, true)
        fakeFileManager.setPathExistence(treeSessionPath, true)
        fakeFileManager.setPathExistence('file1.txt', true)
        fakeFileManager.setPathExistence('file2.txt', true)
        fakeFileManager.setFilecontent('file1.txt', 'test1')
        fakeFileManager.setFilecontent('file2.txt', 'test2')
        fakeFileManager.setPathExistence('/project', true)
        fakeFileManager.setPathExistence('/project/index.ts', true)
        fakeFileManager.setPathExistence('/project/src', true)
        fakeFileManager.setPathExistence('/project/src/main.ts', true)
        fakeTreeManager.setTree(initialTreeSession)

        await fakeTabRepository.setTabSession(initialSession)
        await fakeTreeRepository.setTreeSession(initialTreeSession)

        // When.
        await loadedRenderer(fakeMainWindow as any, fakeFileManager, fakeTabRepository, fakeTreeRepository, fakeTreeManager)

        // Then.
        expect(fakeMainWindow.webContents.send).toHaveBeenCalled()
        expect(fakeMainWindow.webContents.send.mock.calls[0][0]).toBe('session')
        const tabSentData = fakeMainWindow.webContents.send.mock.calls[0][1]
        expect(Array.isArray(tabSentData)).toBe(true)
        expect(tabSentData.length).toBe(2)
        expect(tabSentData[0]).toEqual({
            id: 0,
            isModified: false,
            filePath: 'file1.txt',
            fileName: 'file1.txt',
            content: 'test1',
        })
        expect(tabSentData[1]).toEqual({
            id: 1,
            isModified: false,
            filePath: 'file2.txt',
            fileName: 'file2.txt',
            content: 'test2',
        })
        const treeSentData = fakeMainWindow.webContents.send.mock.calls[0][2]
        expect(treeSentData).toEqual(initialTreeSession)
    })

    test('loadedRenderer: tabSession json file does not exist', async () => {
        // Given.
        fakeFileManager.setPathExistence(TAB_SESSION_PATH, false)
        fakeTabRepository.setTabSession([])

        // When.
        await loadedRenderer(fakeMainWindow as any, fakeFileManager, fakeTabRepository, fakeTreeRepository, fakeTreeManager)

        // Then.
        expect(fakeMainWindow.webContents.send).toHaveBeenCalled()
        expect(fakeMainWindow.webContents.send.mock.calls[0][0]).toBe('session')
        const sentData = fakeMainWindow.webContents.send.mock.calls[0][1]
        expect(Array.isArray(sentData)).toBe(true)
        expect(sentData.length).toBe(0)
    })

    test('loadedRenderer: tabSession text does not exist(length === 0)', async () => {
        // Given.
        fakeFileManager.setPathExistence(TAB_SESSION_PATH, true)
        fakeTabRepository.setTabSession([])

        // When.
        await loadedRenderer(fakeMainWindow as any, fakeFileManager, fakeTabRepository, fakeTreeRepository, fakeTreeManager)

        // Then.
        expect(fakeMainWindow.webContents.send).toHaveBeenCalled()
        expect(fakeMainWindow.webContents.send.mock.calls[0][0]).toBe('session')
        const sentData = fakeMainWindow.webContents.send.mock.calls[0][1]
        expect(Array.isArray(sentData)).toBe(true)
        expect(sentData.length).toBe(0)
    })
})
