import { CLASS_SELECTED } from "../constants/dom"

export default function registerMenuHandlers(menuItems: NodeListOf<HTMLElement>) {
    bindMenucontainerEvents(menuItems)
}

function bindMenucontainerEvents(menuItems: NodeListOf<HTMLElement>) {
    menuItems.forEach(item => {
        item.addEventListener('click', e => {
            menuItems.forEach(i => {
                if (i !== item) i.classList.remove(CLASS_SELECTED)
            })

            item.classList.toggle(CLASS_SELECTED)
        })

        item.addEventListener('mouseenter', () => {
            const anyActive = Array.from(menuItems).some(i => i.classList.contains(CLASS_SELECTED))
            if (anyActive) {
                menuItems.forEach(i => i.classList.remove(CLASS_SELECTED))
                item.classList.add(CLASS_SELECTED)
            }
        })
    })
}
