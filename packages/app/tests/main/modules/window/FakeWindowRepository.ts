import { WindowSessionModel } from "@main/models/WindowSessionModel";
import IFileManager from "@main/modules/contracts/IFileManager";
import IWindowRepository from "@main/modules/contracts/IWindowRepository";

export default class FakeWindowRepository implements IWindowRepository {
	constructor(private windowSessionPath: string, private fakeFileManager: IFileManager) {}

	async readWindowSession(): Promise<WindowSessionModel | null> {
		if (!(await this.fakeFileManager.exists(this.windowSessionPath))) {
			return null;
		}

		const json = await this.fakeFileManager.read(this.windowSessionPath);
		return JSON.parse(json);
	}

	async writeWindowSession(model: WindowSessionModel): Promise<void> {
		await this.fakeFileManager.write(this.windowSessionPath, JSON.stringify(model, null, 2));
	}

	async setWindowSession(model: WindowSessionModel): Promise<void> {
		await this.writeWindowSession(model);
	}
}
