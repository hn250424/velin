export const rendererToMainEvents = {
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
    pasteEditor: 'pasteEditor',
    copyTree: 'copyTree',
    pasteTree: 'pasteTree',

    rename: 'rename',
    delete: 'delete',
    undo_delete: 'undo_delete',
    deletePermanently: 'deletePermanently',
    create: 'create',

    syncSideSessionFromRenderer: 'syncSideSessionFromRenderer',
    syncTabSessionFromRenderer: 'syncTabSessionFromRenderer',
    syncTreeSessionFromRenderer: 'syncTreeSessionFromRenderer',
    getSyncedTreeSession: 'getSyncedTreeSession',

    setWatchSkipState: 'setWatchSkipState'
} as const