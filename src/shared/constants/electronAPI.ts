export const electronAPI = {
    channel: 'electronAPI',
    events: {
        // Main -> Renderer.
        tabSession: 'tabSession',

        // Renderer -> Main.
        loadedRenderer: 'loadedRenderer',
        showMainWindow: 'showMainWindow',
        minimizeWindow: 'minimizeWindow',
        maximizeWindow: 'maximizeWindow',
        unmaximizeWindow: 'unmaximizeWindow',
        closeWindow: 'closeWindow',
        newTab: 'newTab',
        open: 'open',
        save: 'save',
        saveAs: 'saveAs',
        saveAll: 'saveAll',
        closeTab: 'closeTab',

        confirm: 'confirm',
    }
} as const