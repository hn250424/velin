import type IFileWatcher from "@main/modules/contracts/IFileWatcher";
import { BrowserWindow, ipcMain } from "electron";
import { electronAPI } from "@shared/constants/electronAPI/electronAPI";

export default function registerWatchHandlers(mainWindow: BrowserWindow, fileWatcher: IFileWatcher) {
	ipcMain.handle(electronAPI.events.rendererToMain.setWatchSkipState, (e, state) => {
		fileWatcher.setSkipState(state);
	});
}
