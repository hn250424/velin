import { inject, injectable } from "inversify"
import DI_KEYS from "../../constants/di_keys"
import FocusManager from "../state/FocusManager"

@injectable()
export default class ShortcutRegistry {
    private shortcutMap = new Map<string, (e: KeyboardEvent) => any>()

    constructor(
        @inject(DI_KEYS.FocusManager) private readonly focusManager: FocusManager,
    ) {

    }

    register(key: string, handler: (e: KeyboardEvent) => any) {
        this.shortcutMap.set(key, handler)
    }

    handleKeyEvent(e: KeyboardEvent) {
        const key = this.getKeyString(e)
        const handler = this.shortcutMap.get(key)
        if (handler) {
            if (this.focusManager.getFocus() !== 'editor') e.preventDefault()
            handler(e)
        }
    }

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