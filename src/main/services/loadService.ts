import ITreeUtils from "@main/modules/contracts/ITreeUtils";
import ITreeRepository from "src/main/modules/contracts/ITreeRepository";
import { electronAPI } from "@shared/constants/electronAPI/electronAPI";
import TreeDto from "@shared/dto/TreeDto";
import { app, BrowserWindow } from "electron";
import IFileManager from "../modules/contracts/IFileManager";
import ITabRepository from "../modules/contracts/ITabRepository";
import ITabUtils from "../modules/contracts/ITabUtils";
import IFileWatcher from "@main/modules/contracts/IFileWatcher";
import ISideRepository from "@main/modules/contracts/ISideRepository";
import SideDto from "@shared/dto/SideDto";
import IWindowRepository from "@main/modules/contracts/IWindowRepository";
import { getBoundsByWindowSession } from "../actions/windowActions";
import IWindowUtils from "@main/modules/contracts/IWindowUtils";
import ISettingsRepository from "@main/modules/contracts/ISettingsRepository";
import ISettingsUtils from "@main/modules/contracts/ISettingsUtils";

export async function loadedRenderer(
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
	// session.
	const windowSession = await windowRepository.readWindowSession();
	const windowBoundsModel = getBoundsByWindowSession(windowSession);
	mainWindow.setBounds({
		x: windowBoundsModel.x,
		y: windowBoundsModel.y,
		width: windowBoundsModel.width,
		height: windowBoundsModel.height,
	});
	if (windowSession?.maximize) mainWindow.maximize();

	const settingsSession = await settingsRepository.readSettingsSession();

	const sideSession = await sideRepository.readSideSession();

	const tabSession = await tabRepository.readTabSession();
	const newTabSession = tabSession ? await tabUtils.syncSessionWithFs(tabSession) : null;
	if (newTabSession) await tabRepository.writeTabSession(newTabSession);

	const treeSession = await treeRepository.readTreeSession();
	const newTreeSession = treeSession ? await treeUtils.syncWithFs(treeSession) : null;
	if (newTreeSession) await treeRepository.writeTreeSession(newTreeSession);

	const windowDto = windowSession ? windowUtils.toWindowDto(windowSession) : null;
	const settingsDto = settingsSession ? settingsUtils.toSettingsDto(settingsSession) : null;
	const sideDto = sideSession ? (sideSession as SideDto) : null;
	const tabDto = newTabSession ? await tabUtils.toTabEditorsDto(newTabSession) : null;
	const treeDto = newTreeSession ? (newTreeSession as TreeDto) : null;

	mainWindow.webContents.send(
		electronAPI.events.mainToRenderer.session,
		windowDto,
		settingsDto,
		sideDto,
		tabDto,
		treeDto
	);
	fileManager.cleanTrash();

	if (newTreeSession) fileWatcher.watch(newTreeSession.path);

	// info.
	const version = app.getVersion();
	mainWindow.webContents.send(electronAPI.events.mainToRenderer.info, version);
}
