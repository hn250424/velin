export const electronAPI = {
    channel: 'electronAPI',
    events: {
        // Main -> Renderer.
        noTab: 'noTab',

        // Renderer -> Main.
        loadedRenderer: 'loadedRenderer',
        minimize: 'minimize',
        maximize: 'maximize',
        close: 'close',
        open: 'open',
        save: 'save',

        //
        onCreate: 'onCreate',
        onSave: 'onSave',
        onOpen: 'onOpen',
        onSetMode: 'onSetMode',

        sendSave: 'sendSave',
    }
} as const