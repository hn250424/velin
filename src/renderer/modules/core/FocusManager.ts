export default class FocusManager {
    private static instance: FocusManager | null = null

    private focusedTarget: 'editor' | 'tab' | 'tree' | 'other' | null = null

    private constructor() {}

    static getInstance() {
        if (this.instance === null) {
            this.instance = new FocusManager()
        }

        return this.instance
    }

    setFocus(focusedTarget: 'editor' | 'tab' | 'tree' | 'other' | null) {
        this.focusedTarget = focusedTarget
    }

    getFocus() {
        return this.focusedTarget
    }
}