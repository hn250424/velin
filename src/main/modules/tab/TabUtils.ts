import { TabSessionModel } from "@main/models/TabSessionModel";
import { inject, injectable } from "inversify";
import DI_KEYS from "../../constants/di_keys";
import IFileManager from "../contracts/IFileManager";
import ITabUtils from "../contracts/ITabUtils";
import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto";

@injectable()
export default class TabUtils implements ITabUtils {
	constructor(@inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager) {}

	async syncSessionWithFs(session: TabSessionModel): Promise<TabSessionModel> {
		if (!session) return { activatedId: -1, data: [] };

		let isActivatedTabDeleted = false;
		const filteredData: TabEditorDto[] = [];

		for (const data of session.data) {
			try {
				const exists = await this.fileManager.exists(data.filePath);
				if (!exists) throw new Error("No file path");
				filteredData.push(data as TabEditorDto);
			} catch {
				if (data.id === session.activatedId) isActivatedTabDeleted = true;
			}
		}

		const newActivatedId =
			isActivatedTabDeleted && filteredData.length > 0 ? filteredData[filteredData.length - 1].id : session.activatedId;

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
				filePath: d.filePath
			}))
		}
	}
}
