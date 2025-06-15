export const electronAPI = {
    channel: 'electronAPI',
    events: {
        // Main -> Renderer.
        tabSession: 'tabSession',

        // Renderer -> Main.
        loadedRenderer: 'loadedRenderer',
        minimize: 'minimize',
        maximize: 'maximize',
        close: 'close',
        open: 'open',
        save: 'save',
        saveAll: 'saveAll',

        confirm: 'confirm',
    }
} as const