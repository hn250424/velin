export default class FindReplaceState {
	private isDirectionUp = false;

	setDirectionUp(value: boolean) {
		this.isDirectionUp = value;
	}

	getDirectionUp(): boolean {
		return this.isDirectionUp;
	}
}
