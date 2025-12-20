import { BrowserWindow, ipcMain } from "electron";

import { electronAPI } from "@shared/constants/electronAPI/electronAPI";
import SideDto from "@shared/dto/SideDto";
import SideService from "@main/services/SideService";

export default function registerSideHandlers(mainWindow: BrowserWindow, sideService: SideService) {
	ipcMain.handle(electronAPI.events.rendererToMain.syncSideSessionFromRenderer, async (e, dto: SideDto) => {
		await sideService.syncSideSession(dto);
	});
}
