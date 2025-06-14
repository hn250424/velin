export default class StateManager {
    private static instance: StateManager | null = null
    private currentPath: string = ''

    private constructor() {}

    static getInstancec(): StateManager {
        if (this.instance === null) {
            this.instance = new StateManager()
        }

        return this.instance
    }

    getCurrentPath(): string {
        return this.currentPath
    }

    setCurrentPath(path: string) {
        this.currentPath = path
    }
}