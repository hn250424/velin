import type TreeSessionModel from "../models/TreeSessionModel";
import type ITreeRepository from "../modules/contracts/ITreeRepository";
import type IFileManager from "../modules/contracts/IFileManager";
import type { TreeDto } from "@shared/dto/TreeDto";
import type TrashMap from "@shared/types/TrashMap";
import type ClipboardMode from "@shared/types/ClipboardMode";
import type ITreeUtils from "@main/modules/contracts/ITreeUtils";
import type Response from "@shared/types/Response";

import { inject } from "inversify";
import path from "path";
import DI_KEYS from "../constants/di_keys";

export default class TreeService {
	constructor(
		@inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
		@inject(DI_KEYS.TreeUtils) private readonly treeUtils: ITreeUtils,
		@inject(DI_KEYS.TreeRepository) private readonly treeRepository: ITreeRepository
	) {}

	async rename(prePath: string, newPath: string): Promise<Response<string>> {
		try {
			const targetDir = path.dirname(newPath);
			const existingNames = new Set(await this.fileManager.readDir(targetDir));
			const requestedFileName = path.basename(newPath);
			const uniqueFileName = this.fileManager.getUniqueFileNames(existingNames, [requestedFileName]);
			const finalNewPath = path.join(targetDir, uniqueFileName[0]);

			const session = await this.treeRepository.readTreeSession();
			if (!session) {
				return { result: false, data: "" };
			}

			const nodeToUpdate = this._findNodeByPath(session, prePath);

			if (nodeToUpdate) {
				await this.fileManager.rename(prePath, finalNewPath);

				const oldPath = nodeToUpdate.path;
				nodeToUpdate.path = finalNewPath;
				nodeToUpdate.name = path.basename(finalNewPath);

				this._recursivelyUpdateChildrenPaths(nodeToUpdate, oldPath);

				await this.treeRepository.writeTreeSession(session);

				return { result: true, data: finalNewPath };
			}

			return { result: false, data: "" };
		} catch (error) {
			return { result: false, data: prePath };
		}
	}

	private _findNodeByPath(node: TreeSessionModel | TreeDto, targetPath: string): TreeSessionModel | TreeDto | null {
		if (path.normalize(node.path) === path.normalize(targetPath)) {
			return node;
		}
		if (node.children) {
			for (const child of node.children) {
				const found = this._findNodeByPath(child, targetPath);
				if (found) return found;
			}
		}
		return null;
	}

	private _recursivelyUpdateChildrenPaths(parentNode: TreeSessionModel | TreeDto, oldParentPath: string): void {
		if (!parentNode.children) return;

		for (const child of parentNode.children) {
			const oldChildPath = child.path;
			const childBaseName = path.basename(oldChildPath);
			child.path = path.join(parentNode.path, childBaseName);
			child.name = childBaseName;

			if (child.children && child.children.length > 0) {
				this._recursivelyUpdateChildrenPaths(child, oldChildPath);
			}
		}
	}

	async copy(src: string, dest: string) {
		await this.fileManager.copy(src, dest);
	}

	async paste(targetDto: TreeDto, selectedDtos: TreeDto[], clipboardMode: ClipboardMode): Promise<Response<string[]>> {
		const copiedPaths: string[] = [];
		const cutPaths: string[] = [];
		const originalNames = selectedDtos.map((dto) => dto.name);
		const targetDir = targetDto.path;
		const existingNames = new Set(await this.fileManager.readDir(targetDir));
		const uniqueNames = this.fileManager.getUniqueFileNames(existingNames, originalNames);

		try {
			for (const [index, dto] of selectedDtos.entries()) {
				const oldPath = dto.path;
				const uniqueName = uniqueNames[index];
				const newPath = path.join(targetDir, uniqueName);

				await this.fileManager.copy(oldPath, newPath);

				dto.name = uniqueName;
				dto.path = newPath;
				dto.indent = targetDto.indent + 1;

				copiedPaths.push(newPath);
				if (clipboardMode === "cut") cutPaths.push(oldPath);

				if (Array.isArray(dto.children)) {
					for (const child of dto.children) {
						this._updateTreeDto(dto, child);
					}
				}
			}

			if (clipboardMode === "cut") {
				for (const p of cutPaths) {
					await this.fileManager.deletePermanently(p);
				}
			}

			return {
				result: true,
				data: copiedPaths,
			};
		} catch (err) {
			for (const p of copiedPaths) {
				try {
					await this.fileManager.deletePermanently(p);
				} catch (deleteErr) {
					console.error("Rollback failed to delete:", p, deleteErr);
				}
			}
			return {
				result: false,
				data: [],
			};
		}
	}

	private _updateTreeDto(parent: TreeDto, child: TreeDto) {
		child.path = path.join(parent.path, child.name);
		child.indent = parent.indent + 1;

		if (Array.isArray(child.children)) {
			for (const grandChild of child.children) {
				this._updateTreeDto(child, grandChild);
			}
		}
	}

	async delete(arr: string[]): Promise<TrashMap[] | null> {
		try {
			return await this.fileManager.moveToTrash(arr);
		} catch {
			return null;
		}
	}

	async undo_delete(trashMap: TrashMap[] | null): Promise<boolean> {
		try {
			return await this.fileManager.restoreFromTrash(trashMap);
		} catch {
			return false;
		}
	}

	async deletePermanently(path: string): Promise<void> {
		await this.fileManager.deletePermanently(path);
	}

	async create(targetPath: string, directory: boolean) {
		const dir = path.dirname(targetPath);
		const base = path.basename(targetPath);
		const existingNames = new Set(await this.fileManager.readDir(dir));
		const res = this.fileManager.getUniqueFileNames(existingNames, [base]);
		const uniqueName = res[0];
		const uniquePath = path.join(dir, uniqueName);

		await this.fileManager.create(uniquePath, directory);
	}

	async syncTreeSessionFromRenderer(dto: TreeDto): Promise<boolean> {
		try {
			await this.treeRepository.writeTreeSession(dto);
			return true;
		} catch (e) {
			return false;
		}
	}

	async getSyncedTreeSession(): Promise<TreeDto | null> {
		const session = await this.treeRepository.readTreeSession();

		if (session) {
			const newSession = await this.treeUtils.syncWithFs(session);
			if (newSession) await this.treeRepository.writeTreeSession(newSession);
			return newSession;
		} else {
			return null;
		}
	}
}
