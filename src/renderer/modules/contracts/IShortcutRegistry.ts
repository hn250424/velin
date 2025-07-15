export default interface IShortcutRegistry {
    register(key: string, handler: (e: KeyboardEvent) => any): void
    handleKeyEvent(e: KeyboardEvent): void
    getKeyString(e: KeyboardEvent): string
}