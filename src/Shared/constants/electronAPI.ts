export const electronAPI = {
    channel: 'electronAPI',
    events: {
        onCreate: 'onCreate',
        onSave: 'onSave',
        onOpen: 'onOpen',
        onSetMode: 'onSetMode',

        sendSave: 'sendSave',
    }
} as const