import { BrowserWindow, ipcMain } from "electron";

import { electronAPI } from "@shared/constants/electronAPI/electronAPI";
import IFileWatcher from "@main/modules/contracts/IFileWatcher";

export default function registerWatchHandlers(mainWindow: BrowserWindow, fileWatcher: IFileWatcher) {
	ipcMain.handle(electronAPI.events.rendererToMain.setWatchSkipState, (e, state) => {
		fileWatcher.setSkipState(state);
	});
}
