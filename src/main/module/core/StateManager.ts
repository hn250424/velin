import { Mode } from "../../../Shared/constants/Mode" 

export default class StateManager {
    private static instance: StateManager | null = null
    private mode: number = Mode.Reading
    private currentPath: string = ''

    private constructor() {}

    static getInstancec(): StateManager {
        if (this.instance === null) {
            this.instance = new StateManager()
        }

        return this.instance
    }

    getModeState(): number {
        return this.mode
    }

    setModeState(mode: number) {
        this.mode = mode
    }

    getCurrentPath(): string {
        return this.currentPath
    }

    setCurrentPath(path: string) {
        this.currentPath = path
    }
}