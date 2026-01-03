import type IFileManager from "../contracts/IFileManager";
import type ITabUtils from "../contracts/ITabUtils";
import type { TabSessionModel } from "@main/models/TabSessionModel";
import type { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto";
import { inject, injectable } from "inversify";
import DI_KEYS from "../../constants/di_keys";

@injectable()
export default class TabUtils implements ITabUtils {
	constructor(@inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager) {}

	async syncSessionWithFs(session: TabSessionModel): Promise<TabSessionModel> {
		if (!session || !session.data.length) return { activatedId: -1, data: [] };

		const results = await Promise.all(
			session.data.map(async (data) => ({
				data,
				exists: await this.fileManager.exists(data.filePath),
			}))
		);

		const filteredData = results.filter((r) => r.exists).map((r) => r.data as TabEditorDto);
		const isActivatedTabStillExists = filteredData.some((d) => d.id === session.activatedId);

		let newActivatedId = session.activatedId;
		if (!isActivatedTabStillExists) {
			newActivatedId = filteredData.length > 0 ? filteredData[filteredData.length - 1].id : -1;
		}

		return {
			activatedId: newActivatedId,
			data: filteredData,
		};
	}

	async toTabEditorsDto(session: TabSessionModel): Promise<TabEditorsDto> {
		const data = await Promise.all(
			session.data.map(async (data) => {
				let fileName = "";
				if (data.filePath) {
					try {
						fileName = this.fileManager.getBasename(data.filePath);
					} catch {
						fileName = "";
					}
				}

				let content = "";
				let isBinary = false;
				if (data.filePath) {
					try {
						const buffer = await this.fileManager.getBuffer(data.filePath);
						isBinary = this.fileManager.isBinaryContent(buffer);
						content = this.fileManager.toStringFromBuffer(buffer);
						// content = await this.fileManager.read(data.filePath)
					} catch {
						content = "";
					}
				}

				return {
					id: data.id,
					isModified: false,
					filePath: data.filePath,
					fileName,
					content,
					isBinary,
				};
			})
		);

		return {
			activatedId: session.activatedId,
			data,
		};
	}

	toTabSessionModel(tabEditorsDto: TabEditorsDto): TabSessionModel {
		return {
			activatedId: tabEditorsDto.activatedId,
			data: tabEditorsDto.data.map((d) => ({
				id: d.id,
				filePath: d.filePath,
			})),
		};
	}
}
