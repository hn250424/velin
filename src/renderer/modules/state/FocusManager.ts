import { injectable } from "inversify"

type Target = 'editor' | 'tab' | 'tree' | 'other'

@injectable()
export default class FocusManager {
    private focusedTarget: Target = 'other'

    constructor() {}

    setFocus(focusedTarget: Target) {
        this.focusedTarget = focusedTarget
    }

    getFocus() {
        return this.focusedTarget
    }
}