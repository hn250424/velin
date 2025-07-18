import { injectable } from "inversify"

type Target = 'editor' | 'tree' | null

@injectable()
export default class FocusManager {
    private focusedTarget: Target = null

    constructor() {}

    setFocus(focusedTarget: Target) {
        this.focusedTarget = focusedTarget
    }

    getFocus() {
        return this.focusedTarget
    }
}