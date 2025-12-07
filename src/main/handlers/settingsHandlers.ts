import { BrowserWindow, ipcMain } from "electron";

import { electronAPI } from "@shared/constants/electronAPI/electronAPI";
import SettingsDto from "@shared/dto/SettingsDto";
import SettingsService from "@main/services/SettingsService";

export default function registerSettingsHandlers(
	mainWindow: BrowserWindow,
	settingsService: SettingsService
) {
	ipcMain.handle(
		electronAPI.events.rendererToMain.syncSettingsSessionFromRenderer,
		async (e, dto: SettingsDto) => {
			await settingsService.syncSettingsSession(dto);
		}
	);
}
