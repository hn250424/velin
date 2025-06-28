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

        newTab: 'newTab',
        openFile: 'openFile',
        save: 'save',
        saveAs: 'saveAs',
        saveAll: 'saveAll',

        closeTab: 'closeTab',
        closeTabsExcept: 'closeTabsExcept',
        closeTabsToRight: 'closeTabsToRight',
        closeAllTabs: 'closeAllTabs',
        
        exit: 'exit',

        paste: 'paste'
    }
} as const