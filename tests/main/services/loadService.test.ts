import '../mocks/screen'
import { loadedRenderer } from '@services/loadService'
import { TAB_SESSION_PATH } from 'src/main/constants/file_info'
import { beforeEach, describe, expect, test } from 'vitest'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../modules/fs/FakeFileManager'
import FakeTabRepository from '../modules/tab/FakeTabRepository'
import FakeTreeRepository from '../modules/tree/FakeTreeRepository'
import FakeTreeUtils from '../modules/tree/FakeTreeUtils'
import FakeTabUtils from '../modules/tab/FakeTabUtils'
import { TabSessionModel } from 'src/main/models/TabSessionModel'
import FakeFileWatcher from '../modules/fs/FakeFileWatcher'
import FakeSideRepository from '../modules/side/FakeSideRepository'
import SideSessionModel from '@main/models/SideSessionModel'
import FakeSettingsRepository from '../modules/settings/FakeSettingsRepository'
import FakeSettingsUtils from '../modules/settings/FakeSettingsUtils'
import FakeWindowRepository from '../modules/window/FakeWindowRepository'
import FakeWindowUtils from '../modules/window/FakeWindowUtils'
import { WindowSessionModel } from '@main/models/WindowSessionModel'
import SettingsSessionModel from '@main/models/SettingsSessionModel'

describe('loadService.loadedRenderer: ', () => {
    const sideSessionPath = '/fake/path/sideSession.json' 
    const tabSessionPath = '/fake/path/tabSession.json'
    const treeSessionPath = '/fake/path/treeSession.json'
    const settingsSessionPath = '/fake/path/settingsSession.json'
    const windowSessionPath = '/fake/path/windowSession.json'

    let fakeMainWindow: FakeMainWindow
    let fakeFileManager: FakeFileManager
    let fakeSideRepository: FakeSideRepository
    let fakeTabRepository: FakeTabRepository
    let fakeTabUtils: FakeTabUtils
    let fakeTreeRepository: FakeTreeRepository
    let fakeTreeUtils: FakeTreeUtils
    let fakeFileWatcher: FakeFileWatcher
    let fakeSettingsRepository: FakeSettingsRepository
    let fakeSettingsUtils: FakeSettingsUtils
    let fakeWindowRepository: FakeWindowRepository
    let fakeWindowUtils: FakeWindowUtils

    beforeEach(() => {
        fakeMainWindow = new FakeMainWindow()
        fakeFileManager = new FakeFileManager()
        fakeSideRepository = new FakeSideRepository(sideSessionPath, fakeFileManager)
        fakeTabUtils = new FakeTabUtils(fakeFileManager)
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeUtils = new FakeTreeUtils(fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
        fakeFileWatcher = new FakeFileWatcher()
        fakeSettingsRepository = new FakeSettingsRepository(settingsSessionPath, fakeFileManager)
        fakeSettingsUtils = new FakeSettingsUtils(fakeFileManager)
        fakeWindowRepository = new FakeWindowRepository(windowSessionPath, fakeFileManager)
        fakeWindowUtils = new FakeWindowUtils()
    })

    test('loadedRenderer: normal', async () => {
        // Given.
        const initialWindowSession: WindowSessionModel = {
            maximize: false,
            width: 800,
            height: 600,
            x: 100,
            y: 100,
        }

        const initialSettingsSession: SettingsSessionModel = {
            settingFontSessionModel: {
                size: 16
            },

            settingThemeSessionModel: {

            }
        }

        const initialSideSession: SideSessionModel = {
            open: true,
            width: 150
        }

        const initialTabSession: TabSessionModel = {
            activatedId: 1,
            data: [
                { id: 0, filePath: 'file1.txt' },
                { id: 1, filePath: 'file2.txt' },
            ]
        }

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

        fakeFileManager.setPathExistence(windowSessionPath, true)
        fakeFileManager.setPathExistence(settingsSessionPath, true)
        fakeFileManager.setPathExistence(sideSessionPath, true)
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
        fakeTreeUtils.setTree(initialTreeSession)

        await fakeWindowRepository.setWindowSession(initialWindowSession)
        await fakeSettingsRepository.setSettingsSession(initialSettingsSession)
        await fakeSideRepository.setSideSession(initialSideSession)
        await fakeTabRepository.setTabSession(initialTabSession)
        await fakeTreeRepository.setTreeSession(initialTreeSession)

        // When.
        await loadedRenderer(fakeMainWindow as any, fakeFileManager, fakeFileWatcher, fakeWindowRepository, fakeSettingsRepository, fakeSideRepository, fakeTabRepository, fakeTreeRepository, fakeWindowUtils, fakeSettingsUtils, fakeTabUtils, fakeTreeUtils)

        // Then.
        expect(fakeMainWindow.webContents.send).toHaveBeenCalled()
        expect(fakeMainWindow.webContents.send.mock.calls[0][0]).toBe('session')
        const windowSentData = fakeMainWindow.webContents.send.mock.calls[0][1]
        expect(windowSentData.maximize).toBe(initialWindowSession.maximize)
        const settingsSentData = fakeMainWindow.webContents.send.mock.calls[0][2]
        expect(settingsSentData.settingFontDto.size).toBe(initialSettingsSession.settingFontSessionModel.size)
        const sideSentData = fakeMainWindow.webContents.send.mock.calls[0][3]
        expect(sideSentData.open).toBe(initialSideSession.open)
        expect(sideSentData.width).toBe(initialSideSession.width)
        const tabSentData = fakeMainWindow.webContents.send.mock.calls[0][4]
        expect(tabSentData.data.length).toBe(2)
        expect(tabSentData.data[0]).toEqual({
            id: 0,
            isModified: false,
            filePath: 'file1.txt',
            fileName: 'file1.txt',
            content: 'test1',
        })
        expect(tabSentData.data[1]).toEqual({
            id: 1,
            isModified: false,
            filePath: 'file2.txt',
            fileName: 'file2.txt',
            content: 'test2',
        })
        const treeSentData = fakeMainWindow.webContents.send.mock.calls[0][5]
        expect(treeSentData).toEqual(initialTreeSession)
    })

    test('loadedRenderer: tabSession json file does not exist', async () => {
        // Given.
        fakeFileManager.setPathExistence(TAB_SESSION_PATH, false)
        fakeTabRepository.setTabSession(null)

        // When.
        await loadedRenderer(fakeMainWindow as any, fakeFileManager, fakeFileWatcher, fakeWindowRepository, fakeSettingsRepository, fakeSideRepository, fakeTabRepository, fakeTreeRepository, fakeWindowUtils, fakeSettingsUtils, fakeTabUtils, fakeTreeUtils)

        // Then.
        expect(fakeMainWindow.webContents.send).toHaveBeenCalled()
        expect(fakeMainWindow.webContents.send.mock.calls[0][0]).toBe('session')
        const sentData = fakeMainWindow.webContents.send.mock.calls[0][1]
        expect(Array.isArray(sentData)).toBe(false)
    })
})
