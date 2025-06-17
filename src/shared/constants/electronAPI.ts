export const electronAPI = {
    channel: 'electronAPI',
    events: {
        // Main -> Renderer.
        tabSession: 'tabSession',

        // Renderer -> Main.
        loadedRenderer: 'loadedRenderer',
        showMainWindow: 'showMainWindow',
        minimize: 'minimize',
        maximize: 'maximize',
        unmaximize: 'unmaximize',
        close: 'close',
        newTab: 'newTab',
        open: 'open',
        save: 'save',
        saveAs: 'saveAs',
        saveAll: 'saveAll',

        confirm: 'confirm',
    }
} as const