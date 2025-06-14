export default class UiManager {
    private static instance: UiManager | null = null

    private constructor() {}

    static getInstancec(): UiManager {
        if (this.instance === null) {
            this.instance = new UiManager()
        }

        return this.instance
    }
}