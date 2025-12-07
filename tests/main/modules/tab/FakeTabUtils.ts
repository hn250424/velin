import { TabSessionModel } from "@main/models/TabSessionModel";
import IFileManager from "@main/modules/contracts/IFileManager";
import ITabUtils from "@main/modules/contracts/ITabUtils";
import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto";

export default class FakeTabUtils implements ITabUtils {
	constructor(private fakeFileManager: IFileManager) {}

	async syncSessionWithFs(session: TabSessionModel): Promise<TabSessionModel> {
		if (!session) return { activatedId: -1, data: [] };

		const syncedData = await Promise.all(
			session.data.map(async (data) => {
				const filePath = data.filePath ?? "";
				try {
					if (!filePath) throw new Error("No file path");
					await this.fakeFileManager.exists(filePath);
					return data;
				} catch {
					return { ...data, filePath: "" };
				}
			})
		);

		return {
			activatedId: session.activatedId,
			data: syncedData,
		};
	}

	async toTabEditorsDto(session: TabSessionModel): Promise<TabEditorsDto> {
		const data = await Promise.all(
			session.data.map(async (data) => {
				const fileName = data.filePath
					? this.fakeFileManager.getBasename(data.filePath)
					: "";
				const content = data.filePath
					? await this.fakeFileManager.read(data.filePath)
					: "";
				return {
					id: data.id,
					isModified: false,
					filePath: data.filePath,
					fileName,
					content,
					isBinary: false,
				};
			})
		);

		return {
			activatedId: session.activatedId,
			data,
		};
	}
}
