
export default function registerMenuHandlers(menuItems: NodeListOf<HTMLElement>, tabContextMenu: HTMLElement) {
    bindMenucontainerEvents(menuItems, tabContextMenu)
}

function bindMenucontainerEvents(menuItems: NodeListOf<HTMLElement>, tabContextMenu: HTMLElement) {
    menuItems.forEach(item => {
        item.addEventListener('click', e => {
            e.stopPropagation()

            menuItems.forEach(i => {
                if (i !== item) i.classList.remove('active')
            })

            item.classList.toggle('active')

            if (tabContextMenu.style.display === 'flex') {
                tabContextMenu.style.display = 'none'
            }
        })

        item.addEventListener('mouseenter', () => {
            const anyActive = Array.from(menuItems).some(i => i.classList.contains('active'))
            if (anyActive) {
                menuItems.forEach(i => i.classList.remove('active'))
                item.classList.add('active')
            }
        })
    })
}
