export default class FindReplaceState {
    private isDirectionUp = false

    constructor() {}

    setDirectionUp(value: boolean) {
        this.isDirectionUp = value
    }

    getDirectionUp(): boolean {
        return this.isDirectionUp
    }
}