import { BrowserWindow, ipcMain } from "electron";

import { electronAPI } from "@shared/constants/electronAPI/electronAPI";
import IFileManager from "@main/modules/contracts/IFileManager";
import ITabRepository from "@main/modules/contracts/ITabRepository";
import ITreeUtils from "@main/modules/contracts/ITreeUtils";
import ITreeRepository from "@main/modules/contracts/ITreeRepository";
import { loadedRenderer } from "../services/loadService";
import ITabUtils from "@main/modules/contracts/ITabUtils";
import IFileWatcher from "@main/modules/contracts/IFileWatcher";
import ISideRepository from "@main/modules/contracts/ISideRepository";
import IWindowRepository from "@main/modules/contracts/IWindowRepository";
import IWindowUtils from "@main/modules/contracts/IWindowUtils";
import ISettingsRepository from "@main/modules/contracts/ISettingsRepository";
import ISettingsUtils from "@main/modules/contracts/ISettingsUtils";

export default function registerLoadHandlers(
	mainWindow: BrowserWindow,
	fileManager: IFileManager,
	fileWatcher: IFileWatcher,
	windowRepository: IWindowRepository,
	settingsRepository: ISettingsRepository,
	sideRepository: ISideRepository,
	tabRepository: ITabRepository,
	treeRepository: ITreeRepository,
	windowUtils: IWindowUtils,
	settingsUtils: ISettingsUtils,
	tabUtils: ITabUtils,
	treeUtils: ITreeUtils
) {
	ipcMain.on(electronAPI.events.rendererToMain.loadedRenderer, async (e) => {
		loadedRenderer(
			mainWindow,
			fileManager,
			fileWatcher,
			windowRepository,
			settingsRepository,
			sideRepository,
			tabRepository,
			treeRepository,
			windowUtils,
			settingsUtils,
			tabUtils,
			treeUtils
		);
	});

	ipcMain.on(electronAPI.events.rendererToMain.showMainWindow, () => {
		mainWindow.show();
	});
}
