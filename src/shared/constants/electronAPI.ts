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
        open: 'open',
        save: 'save',
        saveAll: 'saveAll',

        confirm: 'confirm',
    }
} as const