import { BrowserWindow } from "electron";
import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto";
import IFileManager from "@main/modules/contracts/IFileManager";
import ITabRepository from "src/main/modules/contracts/ITabRepository";
import IDialogManager from "src/main/modules/contracts/IDialogManager";
import { TabSessionModel, TabSessionData } from "../models/TabSessionModel";
import TreeDto from "@shared/dto/TreeDto";
import ITreeRepository from "src/main/modules/contracts/ITreeRepository";
import TreeSessionModel from "../models/TreeSessionModel";

export default async function exit(
	mainWindow: BrowserWindow,
	fileManager: IFileManager,
	dialogManager: IDialogManager,
	tabRepository: ITabRepository,
	treeRepository: ITreeRepository,
	tabSessionData: TabEditorsDto,
	treeSessionData: TreeDto
) {
	await syncTab(
		mainWindow,
		fileManager,
		dialogManager,
		tabRepository,
		tabSessionData
	);
	await syncTree(treeRepository, treeSessionData as TreeSessionModel);
	mainWindow.close();
}

async function syncTab(
	mainWindow: BrowserWindow,
	fileManager: IFileManager,
	dialogManager: IDialogManager,
	tabRepository: ITabRepository,
	tabSessionData: TabEditorsDto
) {
	const data: TabSessionData[] = [];

	for (const tab of tabSessionData.data) {
		const { id, isModified, filePath, fileName, content } = tab;

		if (!isModified) {
			data.push({ id: id, filePath: filePath });
			continue;
		}

		const confirm = await dialogManager.showConfirmDialog(
			`Do you want to save ${fileName} file?`
		);
		if (!confirm) {
			data.push({ id: id, filePath: filePath });
			continue;
		}

		if (!filePath) {
			const result = await dialogManager.showSaveDialog(mainWindow, fileName);

			if (result.canceled || !result.filePath) {
				data.push({ id: id, filePath: filePath });
			} else {
				await fileManager.write(result.filePath, content);

				data.push({ id: id, filePath: result.filePath });
			}
		} else if (filePath) {
			await fileManager.write(filePath, content);
			data.push({ id: id, filePath: filePath });
		}
	}

	await tabRepository.writeTabSession({
		activatedId: tabSessionData.activatedId,
		data: data,
	});
}

async function syncTree(
	treeRepository: ITreeRepository,
	treeSessionData: TreeSessionModel
) {
	await treeRepository.writeTreeSession(treeSessionData as TreeSessionModel);
}
