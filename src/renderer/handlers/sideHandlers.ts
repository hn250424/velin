import LayoutManager from "../modules/features/LayoutManager"

export default function registerSideHandlers() {
    const layoutManager = LayoutManager.getInstance()
    let isDragging = false
    let treeWidth = 150
    let animationFrameId: number | null = null

    const minWidth = 100
    const maxWidth = 500

    const side = document.getElementById('side')
    const treeToggle = document.getElementById('treeToggle')
    const tree = document.getElementById('tree')
    const resizer = document.getElementById('resizer')

    treeToggle.addEventListener('click', () => {
        const isTreeOpen = layoutManager.isTreeOpen()
        tree.style.width = isTreeOpen ? '0px' : `${treeWidth}px`
        layoutManager.setTreeOpen(!isTreeOpen)
    })

    resizer.addEventListener('mousedown', (e) => {
        if (!layoutManager.isTreeOpen()) {
            tree.style.width = `${minWidth}px`
            layoutManager.setTreeOpen(true)
            treeWidth = minWidth
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

        treeWidth = newWidth
    })
}
