import LayoutManager from "../modules/features/LayoutManager"

export default function registerSideHandlers() {
    const layoutManager = LayoutManager.getInstance()

    const treeToggle = document.getElementById('treeToggle')
    const tree = document.getElementById('tree')

    treeToggle.addEventListener('click', () => {
        const isTreeOpen = layoutManager.isTreeOpen()
        if (isTreeOpen) tree.style.width = '0px'
        else tree.style.width = '150px'
        layoutManager.setTreeOpen(!isTreeOpen)
    })
}