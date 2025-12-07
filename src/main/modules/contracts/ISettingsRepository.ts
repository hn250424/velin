import SettingsSessionModel from "src/main/models/SettingsSessionModel";

export default interface ISettingsRepository {
	readSettingsSession(): Promise<SettingsSessionModel | null>;
	writeSettingsSession(model: SettingsSessionModel): Promise<void>;
}
