import ITreeRepository from "src/main/modules/contracts/ITreeRepository";
import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto";
import { BrowserWindow } from "electron";
import { inject } from "inversify";
import DI_KEYS from "../constants/di_keys";
import IDialogManager from "../modules/contracts/IDialogManager";
import IFileManager from "../modules/contracts/IFileManager";
import ITabRepository from "../modules/contracts/ITabRepository";
import { TabSessionData } from "../models/TabSessionModel";
import TreeDto from "@shared/dto/TreeDto";
import ITreeUtils from "@main/modules/contracts/ITreeUtils";
import IFileWatcher from "@main/modules/contracts/IFileWatcher";

export default class FileService {
	constructor(
		@inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
		@inject(DI_KEYS.TabRepository) private readonly tabRepository: ITabRepository,
		@inject(DI_KEYS.dialogManager) private readonly dialogManager: IDialogManager,
		@inject(DI_KEYS.TreeRepository) private readonly treeRepository: ITreeRepository,
		@inject(DI_KEYS.TreeUtils) private readonly treeUtils: ITreeUtils,
		@inject(DI_KEYS.FileWatcher) private readonly fileWatcher: IFileWatcher
	) {}

	async newTab() {
		const model = (await this.tabRepository.readTabSession()) ?? {
			activatedId: -1,
			data: [],
		};

		const data = model.data;
		const id = data.length > 0 ? data[data.length - 1].id + 1 : 0;
		data.push({ id: id, filePath: "" });
		await this.tabRepository.writeTabSession(model);
		return id;
	}

	async openFile(filePath?: string): Promise<TabEditorDto> {
		if (!filePath) {
			const result = await this.dialogManager.showOpenFileDialog();
			if (result.canceled || result.filePaths.length === 0) {
				return null;
			}
			filePath = result.filePaths[0];
		}

		const fileName = this.fileManager.getBasename(filePath);
		const buffer = await this.fileManager.getBuffer(filePath);
		const isBinary = this.fileManager.isBinaryContent(buffer);
		const content = this.fileManager.toStringFromBuffer(buffer);

		const model = (await this.tabRepository.readTabSession()) ?? {
			activatedId: -1,
			data: [],
		};

		const data = model.data;
		const id = data.length > 0 ? data[data.length - 1].id + 1 : 0;
		data.push({ id: id, filePath: filePath });
		model.activatedId = id;
		await this.tabRepository.writeTabSession(model);

		return {
			id: id,
			isModified: false,
			filePath: filePath,
			fileName: fileName,
			content: content,
			isBinary: isBinary,
		};
	}

	async openDirectory(dto?: TreeDto): Promise<TreeDto | null> {
		let path;
		let indent;

		if (!dto || !dto.path) {
			const result = await this.dialogManager.showOpenDirectoryDialog();

			if (result.canceled || result.filePaths.length === 0) {
				return null;
			}

			path = result.filePaths[0];
			indent = 0;
		} else {
			path = dto.path;
			indent = dto.indent;
		}

		const fsTree = await this.treeUtils.getDirectoryTree(path, indent);
		if (!fsTree) return null;

		if (indent === 0) {
			await this.treeRepository.writeTreeSession(fsTree);
			this.fileWatcher.watch(path);
		} else {
			const session = await this.treeRepository.readTreeSession();
			const updatedSession = await this.treeUtils.getSessionModelWithFs(path, indent, fsTree.children, session);
			await this.treeRepository.writeTreeSession(updatedSession);
		}

		return {
			path,
			name: this.fileManager.getBasename(path),
			indent,
			directory: fsTree.directory,
			expanded: fsTree.expanded,
			children: fsTree?.children ?? [],
		};
	}

	async save(data: TabEditorDto, mainWindow: BrowserWindow, writeSession = true) {
		if (!data.filePath) {
			const result = await this.dialogManager.showSaveDialog(mainWindow, data.fileName);

			if (result.canceled || !result.filePath) {
				return data;
			} else {
				await this.fileManager.write(result.filePath, data.content);

				const tabSession = (await this.tabRepository.readTabSession()) ?? {
					activatedId: -1,
					data: [],
				};

				const session = tabSession.data.find((s) => s.id === data.id);
				if (session) session.filePath = result.filePath;
				if (writeSession) await this.tabRepository.writeTabSession(tabSession);

				return {
					...data,
					isModified: false,
					filePath: result.filePath,
					fileName: this.fileManager.getBasename(result.filePath),
				};
			}
		} else {
			await this.fileManager.write(data.filePath, data.content);
			return {
				...data,
				isModified: false,
				filePath: data.filePath,
				fileName: this.fileManager.getBasename(data.filePath),
			};
		}
	}

	async saveAs(data: TabEditorDto, mainWindow: BrowserWindow): Promise<TabEditorDto> {
		const result = await this.dialogManager.showSaveDialog(mainWindow, data.fileName);

		if (result.canceled || !result.filePath) {
			return null;
		} else {
			await this.fileManager.write(result.filePath, data.content);

			const model = (await this.tabRepository.readTabSession()) ?? {
				activatedId: -1,
				data: [],
			};
			const arr = model.data;
			const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0;
			arr.push({ id: id, filePath: result.filePath });
			model.data = arr;
			this.tabRepository.writeTabSession(model);

			return {
				id: id,
				isModified: false,
				filePath: result.filePath,
				fileName: this.fileManager.getBasename(result.filePath),
				content: data.content,
				isBinary: data.isBinary,
			};
		}
	}

	async saveAll(dto: TabEditorsDto, mainWindow: BrowserWindow) {
		const sessionArr: TabSessionData[] = [];
		const responseArr: TabEditorDto[] = [];

		for (const tab of dto.data) {
			const { id, isModified, filePath, fileName, content, isBinary } = tab;

			if (!isModified) {
				sessionArr.push({ id: id, filePath: filePath });
				responseArr.push({
					id: id,
					isModified: false,
					filePath: filePath,
					fileName: fileName,
					content: content,
					isBinary: isBinary,
				});
				continue;
			}

			const result = await this.save(tab, mainWindow, false);
			sessionArr.push({ id: result.id, filePath: result.filePath });
			responseArr.push(result);
		}

		await this.tabRepository.writeTabSession({
			activatedId: dto.activatedId,
			data: sessionArr,
		});

		return {
			activatedId: dto.activatedId,
			data: responseArr,
		};
	}
}
