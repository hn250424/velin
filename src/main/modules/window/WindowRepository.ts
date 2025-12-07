import { WindowSessionModel } from "src/main/models/WindowSessionModel";
import IFileManager from "@main/modules/contracts/IFileManager";
import IWindowRepository from "src/main/modules/contracts/IWindowRepository";

export default class WindowRepository implements IWindowRepository {
	private session: WindowSessionModel | null = null;

	constructor(private sessionPath: string, private fileManager: IFileManager) {}

	async readWindowSession(): Promise<WindowSessionModel> {
		if (this.session) return this.session;

		try {
			const json = await this.fileManager.read(this.sessionPath);
			this.session = JSON.parse(json);
			return this.session;
		} catch (e) {
			return null;
		}
	}

	async writeWindowSession(model: WindowSessionModel) {
		this.session = model;
		this.fileManager.write(this.sessionPath, JSON.stringify(model, null, 4));
	}
}
