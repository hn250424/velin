import exit from '@services/exitService'
import { TabEditorDto, TabEditorsDto } from '@shared/dto/TabEditorDto'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import FakeMainWindow from '../mocks/FakeMainWindow'
import FakeFileManager from '../modules/fs/FakeFileManager'
import fakeDialogManager, {
    setFakeConfirmResult,
    setFakeSaveDialogResult
} from '../modules/ui/fakeDialogManager'
import FakeTabRepository from '../modules/tab/FakeTabRepository'
import FakeTreeRepository from '../modules/tree/FakeTreeRepository'
import TreeDto from '@shared/dto/TreeDto'
import { TabSessionModel } from 'src/main/models/TabSessionModel'
import FakeTreeUtils from '../modules/tree/FakeTreeUtils'

const tabSessionPath = '/fake/path/tabSession.json'
const treeSessionPath = '/fake/path/treeSession.json'
let fakeMainWindow: FakeMainWindow
let fakeFileManager: FakeFileManager
let fakeTabRepository: FakeTabRepository
let fakeTreeUtils: FakeTreeUtils
let fakeTreeRepository: FakeTreeRepository

const preFilePath = 'preFilePath'
const newFilePath = 'newFilePath'
const preFileName = 'preFileName'
const newFileName = 'newFileName'
const preFileContent = 'preFileContent'
const newFileContent = 'newFileContent'

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
            children: null
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
                    children: null
                }
            ]
        }
    ]
}

describe('exitService.exit', () => {
    beforeEach(() => {
        fakeMainWindow = new FakeMainWindow()
        fakeFileManager = new FakeFileManager()
        fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager)
        fakeTreeUtils = new FakeTreeUtils(fakeFileManager)
        fakeTreeRepository = new FakeTreeRepository(treeSessionPath, fakeFileManager)
    })

    test('test when user cancels confirm dialog', async () => {
        // Given.
        const copiedTabEditorDto = {...tabEidtorDto}
        const copiedTreeDto = { ...treeDto }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        fakeFileManager.setPathExistence(treeSessionPath, true)
        setFakeConfirmResult(false)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        copiedTabEditorDto.data.forEach((data, i) => {
            fakeFileManager.setFilecontent(data.filePath, 'dummy')
        })
        const model: TabSessionModel = {
            activatedId: 99,
            data: copiedTabEditorDto.data.map(({ id, filePath }) => ({ id, filePath }))
        }
        await fakeTabRepository.setTabSession(model)
        await fakeTreeRepository.setTreeSession({
            path: '/old',
            name: 'old',
            indent: 0,
            directory: true,
            expanded: false,
            children: []
        })
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        await exit(fakeMainWindow as any, fakeFileManager, fakeDialogManager, fakeTabRepository, fakeTreeRepository, copiedTabEditorDto, copiedTreeDto)

        // Then.
        const session = await fakeTabRepository.readTabSession()
        expect(session.activatedId).toBe(copiedTabEditorDto.activatedId)
        const sessionData = session.data
        expect(sessionData[0].filePath).toBe('')
        expect(sessionData[1].filePath).toBe(copiedTabEditorDto.data[1].filePath)
        const file_2 = await fakeFileManager.read(copiedTabEditorDto.data[2].filePath)
        expect(file_2).not.toBe(copiedTabEditorDto.data[2].content)
        const file_3 = await fakeFileManager.read(copiedTabEditorDto.data[3].filePath)
        expect(file_3).not.toBe(copiedTabEditorDto.data[3].content)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(fakeMainWindow.close).toHaveBeenCalled()
        const treeSession = await fakeTreeRepository.readTreeSession()
        expect(treeSession).toEqual(copiedTreeDto)
    })

    test('test when user confirm dialog and cancels open dialog', async () => {
        // Given.
        const copiedTabEditorDto = {...tabEidtorDto}
        const copiedTreeDto = { ...treeDto }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        fakeFileManager.setPathExistence(treeSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: true,
            filePath: ''
        })
        copiedTabEditorDto.data.forEach((data, i) => {
            fakeFileManager.setFilecontent(data.filePath, 'dummy')
        })
        await fakeTreeRepository.setTreeSession({
            path: '/old',
            name: 'old',
            indent: 0,
            directory: true,
            expanded: false,
            children: []
        })
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        await exit(fakeMainWindow as any, fakeFileManager, fakeDialogManager, fakeTabRepository, fakeTreeRepository, copiedTabEditorDto, copiedTreeDto)

        // Then.
        const session = await fakeTabRepository.readTabSession()
        expect(session.data[0].filePath).toBe('')
        expect(session.data[1].filePath).toBe(copiedTabEditorDto.data[1].filePath)
        const file_2 = await fakeFileManager.read(copiedTabEditorDto.data[2].filePath)
        expect(file_2).toBe(copiedTabEditorDto.data[2].content)
        const file_3 = await fakeFileManager.read(copiedTabEditorDto.data[3].filePath)
        expect(file_3).not.toBe(copiedTabEditorDto.data[3].content)
        expect(spy).toHaveBeenCalledTimes(3)
        expect(fakeMainWindow.close).toHaveBeenCalled()
        const treeSession = await fakeTreeRepository.readTreeSession()
        expect(treeSession).toEqual(copiedTreeDto)
    })

    test('test when user confirm dialog and select file path', async () => {
        // Given.
        const copiedTabEditorDto = {...tabEidtorDto}
        const copiedTreeDto = { ...treeDto }
        fakeFileManager.setPathExistence(tabSessionPath, true)
        fakeFileManager.setPathExistence(treeSessionPath, true)
        setFakeConfirmResult(true)
        setFakeSaveDialogResult({
            canceled: false,
            filePath: newFilePath
        })
        copiedTabEditorDto.data.forEach((data, i) => {
            fakeFileManager.setFilecontent(data.filePath, 'dummy')
        })
        await fakeTreeRepository.setTreeSession({
            path: '/old',
            name: 'old',
            indent: 0,
            directory: true,
            expanded: false,
            children: []
        })
        const spy = vi.spyOn(fakeFileManager, 'write')

        // When.
        await exit(fakeMainWindow as any, fakeFileManager, fakeDialogManager, fakeTabRepository, fakeTreeRepository, copiedTabEditorDto, copiedTreeDto)

        // Then.
        const session = await fakeTabRepository.readTabSession()
        expect(session.data[0].filePath).toBe('')
        expect(session.data[1].filePath).toBe(copiedTabEditorDto.data[1].filePath)
        const file_2 = await fakeFileManager.read(copiedTabEditorDto.data[2].filePath)
        expect(file_2).toBe(copiedTabEditorDto.data[2].content)
        expect(session.data[3].filePath).toBe(newFilePath)
        const file_3 = await fakeFileManager.read(newFilePath)
        expect(file_3).toBe(copiedTabEditorDto.data[3].content)
        expect(spy).toHaveBeenCalledTimes(4)
        expect(fakeMainWindow.close).toHaveBeenCalled()
        const treeSession = await fakeTreeRepository.readTreeSession()
        expect(treeSession).toEqual(copiedTreeDto)
    })
})