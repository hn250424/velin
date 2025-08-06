import SideState from "../modules/state/SideState"

export default function registerSideHandlers(sideState: SideState) {
    let isDragging = false
    let sideWidth = 150
    let animationFrameId: number | null = null

    const minWidth = 100
    const maxWidth = 500

    const side = document.getElementById('side')
    const treeToggle = document.getElementById('treeToggle')
    const tree = document.getElementById('tree')
    const resizer = document.getElementById('side_resizer')

    treeToggle.addEventListener('click', () => {
        const isOpen = sideState.isOpen()
        tree.style.width = isOpen ? '0px' : `${sideWidth}px`
        sideState.setOpenState(!isOpen)
    })

    // TODO
    const isOpen = sideState.isOpen()
    tree.style.width = isOpen ? '0px' : `${sideWidth}px`
    sideState.setOpenState(!isOpen)

    resizer.addEventListener('mousedown', (e) => {
        if (!sideState.isOpen()) {
            tree.style.width = `${minWidth}px`
            sideState.setOpenState(true)
            sideWidth = minWidth
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

    document.addEventListener('mouseup', (e) => {
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

        sideWidth = newWidth
    })
}
