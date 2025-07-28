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

        cutEditor: 'cutEditor',
        copyEditor: 'copyEditor',
        copyTree: 'copyTree',
        pasteEditor: 'pasteEditor',
        pasteTree: 'pasteTree',
        deletePermanently: 'deletePermanently',

        rename: 'rename',
        delete: 'delete',
        undo_delete: 'undo_delete',

        syncTabSessionFromRenderer: 'syncTabSessionFromRenderer',
        syncTreeSessionFromRenderer: 'syncTreeSessionFromRenderer',
        getSyncedTreeSession: 'getSyncedTreeSession'
    }
} as const