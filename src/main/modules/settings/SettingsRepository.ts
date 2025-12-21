import SettingsSessionModel from "src/main/models/SettingsSessionModel";
import IFileManager from "@main/modules/contracts/IFileManager";
import ISettingsRepository from "src/main/modules/contracts/ISettingsRepository";

export default class SettingsRepository implements ISettingsRepository {
	private session: SettingsSessionModel | null = null;

	constructor(private settingsSessionPath: string, private fileManager: IFileManager) {}

	async readSettingsSession(): Promise<SettingsSessionModel | null> {
		if (this.session) return this.session;

		try {
			const json = await this.fileManager.read(this.settingsSessionPath);
			this.session = JSON.parse(json);
			return this.session;
		} catch (e) {
			if (e?.code === "ENOENT"){
				return null;
			}
			throw e;
		}
	}

	async writeSettingsSession(model: SettingsSessionModel) {
		this.session = model;
		this.fileManager.write(this.settingsSessionPath, JSON.stringify(model, null, 2));
	}
}
