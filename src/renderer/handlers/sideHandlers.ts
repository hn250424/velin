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

    processOpenState()

    treeToggle.addEventListener('click', async () => {
        const isOpen = sideState.isOpen()
        sideState.setOpenState(!isOpen)
        syncSession()
        processOpenState()
    })

    resizer.addEventListener('mousedown', (e) => {
        if (!sideState.isOpen()) {
            sideState.setOpenState(true)
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

        sideState.setSidth(newWidth)
        syncSession()
    })

    function processOpenState() {
        const isOpen = sideState.isOpen()
        if (isOpen) {
            tree.style.width = `${sideState.getWidth()}px`
            treeToggle.classList.add(CLASS_SELECTED)
        } else {
            tree.style.width = '0px'
            treeToggle.classList.remove(CLASS_SELECTED)
        }
    }

    async function syncSession() {
        const sideDto: SideDto = {
            open: sideState.isOpen(),
            width: sideState.getWidth()
        }
        const result = await window.rendererToMain.syncSideSessionFromRenderer(sideDto)
    }
}