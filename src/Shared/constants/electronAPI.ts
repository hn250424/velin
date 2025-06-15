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
        saveAll: 'saveAll',

        confirm: 'confirm',

        //
        onCreate: 'onCreate',
        onSave: 'onSave',
        onOpen: 'onOpen',
        onSetMode: 'onSetMode',

        sendSave: 'sendSave',
    }
} as const