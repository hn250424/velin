import exit from "@services/exitService";
import { electronAPI } from "@shared/constants/electronAPI/electronAPI";
import { TabEditorsDto } from "@shared/dto/TabEditorDto";
import TreeDto from "@shared/dto/TreeDto";
import { BrowserWindow, ipcMain } from "electron";
import IDialogManager from "@main/modules/contracts/IDialogManager";
import IFileManager from "@main/modules/contracts/IFileManager";
import ITabRepository from "@main/modules/contracts/ITabRepository";
import ITreeRepository from "@main/modules/contracts/ITreeRepository";

export default function registerExitHandlers(
	mainWindow: BrowserWindow,
	fileManager: IFileManager,
	dialogManager: IDialogManager,
	tabRepository: ITabRepository,
	treeRepository: ITreeRepository
) {
	ipcMain.handle(
		electronAPI.events.rendererToMain.exit,
		async (e, tabSessionData: TabEditorsDto, treeSessionData: TreeDto) => {
			await exit(
				mainWindow,
				fileManager,
				dialogManager,
				tabRepository,
				treeRepository,
				tabSessionData,
				treeSessionData
			);
		}
	);
}
