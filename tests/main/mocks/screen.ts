import { vi } from 'vitest'

vi.mock('electron', async () => {
    const actual = await vi.importActual<any>('electron')
    return {
        ...actual,
        screen: {
            getPrimaryDisplay: vi.fn(() => ({ workAreaSize: { width: 1920, height: 1080 } }))
        }
    }
})