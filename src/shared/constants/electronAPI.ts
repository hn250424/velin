export const electronAPI = {
    channel: 'electronAPI',
    events: {
        // Main -> Renderer.
        tabSession: 'tabSession',
        onMaximizeWindow: 'onMaximizeWindow',
        onUnmaximizeWindow: 'onUnmaximizeWindow',

        // Renderer -> Main.
        loadedRenderer: 'loadedRenderer',
        showMainWindow: 'showMainWindow',

        requestMinimizeWindow: 'requestMinimizeWindow',
        requestMaximizeWindow: 'requestMaximizeWindow',
        requestUnmaximizeWindow: 'requestUnmaximizeWindow',

        newTab: 'newTab',
        openFile: 'openFile',
        openDirectory: 'openDirectory',
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