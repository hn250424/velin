export const electronAPI = {
    channel: 'electronAPI',
    events: {
        // Main -> Renderer.
        session: 'session',
        
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

        cut: 'cut',
        copy: 'copy',
        paste: 'paste',

        renameTree: 'renameTree',
        renameTab: 'renameTab',
    }
} as const