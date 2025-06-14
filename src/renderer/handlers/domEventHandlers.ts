import UiManager from "../modules/core/UiManager"

export default function registerDomEventHandlers() {
    const uiManager = UiManager.getInstancec()

    const menuItems = document.querySelectorAll('#menu_bar .menu_item')

    menuItems.forEach(item => {
        item.addEventListener('click', e => {
            e.stopPropagation()

            menuItems.forEach(i => {
                if (i !== item) i.classList.remove('active')
            })

            item.classList.toggle('active')
        })
    })

    document.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'))
    })

    document.getElementById('title_bar').addEventListener('mousedown', () => {
        document.querySelectorAll('.menu_item').forEach(item => item.classList.remove('active'))
    })
}