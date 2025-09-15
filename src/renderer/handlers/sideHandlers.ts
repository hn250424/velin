import SideState from "../modules/state/SideState"
import { CLASS_SELECTED } from "../constants/dom"
import SideDto from "@shared/dto/SideDto"

export default function registerSideHandlers(sideState: SideState) {
    let isDragging = false
    let animationFrameId: number | null = null

    const minWidth = 100
    const maxWidth = 500

    const side = document.getElementById('side')

    const treeToggle = document.getElementById('treeToggle')
    const tree = document.getElementById('tree')
    const resizer = document.getElementById('side_resizer')

    const settingsBtn = document.getElementById('settingsBtn')
    const settingsOverlay = document.getElementById('settings-overlay')
    const settingsContainer = document.getElementById('settings-container')
    const settingsTop = document.getElementById('settings-top')
    const settingsExit = document.getElementById('settings-exit')
    const settingsSection = document.getElementById('settings-section')
    
    const settingsMenuTheme = document.getElementById('settings-menu-theme')
    const settingsMenuFont = document.getElementById('settings-menu-font')
    const settingsContentsTheme = document.getElementById('settings-contents-theme')
    const settingsContentsFont = document.getElementById('settings-contents-font')

    processTreeOpenState()

    // open & close file tree.
    treeToggle.addEventListener('click', async () => {
        const isOpen = sideState.isTreeOpen()
        sideState.setTreeOpenState(!isOpen)
        syncSession()
        processTreeOpenState()
    })

    function processTreeOpenState() {
        const isOpen = sideState.isTreeOpen()
        if (isOpen) {
            tree.style.width = `${sideState.getTreeWidth()}px`
            treeToggle.classList.add(CLASS_SELECTED)
        } else {
            tree.style.width = '0px'
            treeToggle.classList.remove(CLASS_SELECTED)
        }
    }

    async function syncSession() {
        const sideDto: SideDto = {
            open: sideState.isTreeOpen(),
            width: sideState.getTreeWidth()
        }
        const result = await window.rendererToMain.syncSideSessionFromRenderer(sideDto)
    }

    // resize.
    resizer.addEventListener('mousedown', (e) => {
        if (!sideState.isTreeOpen()) {
            sideState.setTreeOpenState(true)
        }

        isDragging = true
        document.body.style.cursor = 'ew-resize'
        document.body.style.userSelect = 'none'
    })

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
        }

        animationFrameId = requestAnimationFrame(() => {
            const sideRect = side.getBoundingClientRect()
            const offsetX = e.clientX - sideRect.left
            const newWidth = Math.min(Math.max(offsetX, minWidth), maxWidth)

            tree.style.width = `${newWidth}px`
        })
    })

    document.addEventListener('mouseup', async (e) => {
        if (!isDragging) return

        isDragging = false
        document.body.style.cursor = 'default'
        document.body.style.userSelect = 'auto'

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
        }

        const sideRect = side.getBoundingClientRect()
        const offsetX = e.clientX - sideRect.left
        const newWidth = Math.min(Math.max(offsetX, minWidth), maxWidth)

        sideState.setTreeSidth(newWidth)
        syncSession()
    })

    // open & close settings container.
    settingsBtn.addEventListener('click', () => {
        settingsOverlay.style.display = 'flex'
        sideState.setSettingsOpenState(true)
        settingsBtn.classList.add(CLASS_SELECTED)
    })

    settingsExit.addEventListener('click', () => {
        settingsOverlay.style.display = 'none'
        sideState.setSettingsOpenState(false)
        settingsBtn.classList.remove(CLASS_SELECTED)
    })

    settingsMenuTheme.addEventListener('click', () => {
        settingsContentsTheme.style.display = 'block'
        settingsContentsFont.style.display = 'none'
    })

    settingsMenuFont.addEventListener('click', () => {
        settingsContentsFont.style.display = 'block'
        settingsContentsTheme.style.display = 'none'
    })
}