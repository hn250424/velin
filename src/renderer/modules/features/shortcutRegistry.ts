const shortcutMap = new Map<string, () => any>()

const shortcutRegistry = {
    register(key: string, handler: () => any) {
        shortcutMap.set(key, handler)
    },

    handleKeyEvent(e: KeyboardEvent) {
        const key = this.getKeyString(e)
        const handler = shortcutMap.get(key)
        if (handler) {
            e.preventDefault()
            handler()
        }
    },

    getKeyString(e: KeyboardEvent): string {
        const parts = []
        if (e.ctrlKey) parts.push('Ctrl')
        if (e.shiftKey) parts.push('Shift')
        if (e.altKey) parts.push('Alt')

        let key = e.key

        if (key === '=') key = '+'
        if (key === 'Escape') key = 'Esc'
        if (key === ' ') key = 'Space'

        parts.push(key.toUpperCase())
        return parts.join('+')
    }
}

export default shortcutRegistry