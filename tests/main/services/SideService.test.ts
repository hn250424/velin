import SideService from '@services/SideService'
import SideDto from '@shared/dto/SideDto'
import { beforeEach, describe, expect, test } from 'vitest'
import FakeFileManager from '../modules/fs/FakeFileManager'
import FakeSideRepository from '../modules/side/FakeSideRepository'

describe('SideService.syncSideSession', () => {
    const sideDto: SideDto = {
        open: true,
        width: 150,
    }

    const sideSessionPath = '/fake/path/sideSession.json' 

    let fakeFileManager: FakeFileManager
    let fakeSideRepository: FakeSideRepository
    let sideService: SideService

    beforeEach(() => {
        fakeFileManager = new FakeFileManager()
        fakeSideRepository = new FakeSideRepository(sideSessionPath, fakeFileManager)
        sideService = new SideService(fakeFileManager, fakeSideRepository)
    })

    test('a write session was received from the renderer for synchronization', async () => {
        // Given.
        const copiedSideDto = { ...sideDto }

        // When.
        await sideService.syncSideSession(copiedSideDto)

        // Then.
        const sideSession = await fakeSideRepository.readSideSession()
        expect(sideSession.open).toBe(copiedSideDto.open)
        expect(sideSession.width).toBe(copiedSideDto.width)
    })
})