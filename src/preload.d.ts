export { }

declare global {
    interface Window {
        electronAPI: {
            onSetMode: (callback: (mode: number) => void) => void
        }
    }
}