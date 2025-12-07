import TreeSessionModel from "@main/models/TreeSessionModel";
import TreeService from "@services/TreeService";
import TreeDto from "@shared/dto/TreeDto";
import path from "path";
import { beforeEach, describe, expect, test } from "vitest";
import FakeFileManager from "../modules/fs/FakeFileManager";
import FakeTreeUtils from "../modules/tree/FakeTreeUtils";
import FakeTabRepository from "../modules/tab/FakeTabRepository";
import FakeTreeRepository from "../modules/tree/FakeTreeRepository";

import { tabSessionPath, treeSessionPath, treeDto } from "../data/test_data";

let fakeFileManager: FakeFileManager;
let fakeTreeUtils: FakeTreeUtils;
let fakeTabRepository: FakeTabRepository;
let fakeTreeRepository: FakeTreeRepository;
let treeService: TreeService;

const treeSessionModel: TreeSessionModel = {
	path: "D:\\node-workspace\\velin\\test_file",
	name: "test_file",
	indent: 0,
	directory: true,
	expanded: true,
	children: [
		{
			path: "D:\\node-workspace\\velin\\test_file\\dir333",
			name: "dir333",
			indent: 1,
			directory: true,
			expanded: true,
			children: [
				{
					path: "D:\\node-workspace\\velin\\test_file\\dir333\\deep",
					name: "deep",
					indent: 2,
					directory: true,
					expanded: true,
					children: [
						{
							path: "D:\\node-workspace\\velin\\test_file\\dir333\\deep\\14.md",
							name: "14.md",
							indent: 3,
							directory: false,
							expanded: false,
							children: null,
						},
					],
				},
				{
					path: "D:\\node-workspace\\velin\\test_file\\test139.md",
					name: "test139.md",
					indent: 1,
					directory: false,
					expanded: false,
					children: null,
				},
				{
					path: "D:\\node-workspace\\velin\\test_file\\test139-1.md",
					name: "test139-1.md",
					indent: 1,
					directory: false,
					expanded: false,
					children: null,
				},
				{
					path: "D:\\node-workspace\\velin\\test_file\\test139-3.md",
					name: "test139-3.md",
					indent: 1,
					directory: false,
					expanded: false,
					children: null,
				},
			],
		},
		{
			path: "D:\\node-workspace\\velin\\test_file\\test139.md",
			name: "test139.md",
			indent: 1,
			directory: false,
			expanded: false,
			children: null,
		},
		{
			path: "D:\\node-workspace\\velin\\test_file\\test139-1.md",
			name: "test139-1.md",
			indent: 1,
			directory: false,
			expanded: false,
			children: null,
		},
		{
			path: "D:\\node-workspace\\velin\\test_file\\test139-3.md",
			name: "test139-3.md",
			indent: 1,
			directory: false,
			expanded: false,
			children: null,
		},
	],
};

function traverse(
	node: TreeSessionModel | TreeDto,
	cb: (node: TreeSessionModel | TreeDto) => void
) {
	cb(node);
	for (const child of node.children ?? []) {
		traverse(child, cb);
	}
}

function deepCopyTreeSessionModel(model: TreeSessionModel): TreeSessionModel {
	return {
		...model,
		children: model.children
			? model.children.map((child) => deepCopyTreeDto(child))
			: [],
	};
}

function deepCopyTreeDto(dto: TreeDto): TreeDto {
	return {
		...dto,
		children: dto.children
			? dto.children.map((child) => deepCopyTreeDto(child))
			: [],
	};
}

describe("treeService.rename", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeRepository = new FakeTreeRepository(
			treeSessionPath,
			fakeFileManager
		);
		treeService = new TreeService(
			fakeFileManager,
			fakeTreeUtils,
			fakeTreeRepository
		);
	});

	test("should sync renamed session including children nodes", async () => {
		// Given.
		const copiedTreeSessionModel = deepCopyTreeSessionModel(treeSessionModel);
		traverse(copiedTreeSessionModel, (model) => {
			fakeFileManager.setPathExistence(model.path, true);
			fakeFileManager.setFilecontent(model.path, model.name);
		});
		await fakeTreeRepository.setTreeSession(copiedTreeSessionModel);
		const oldRoot = copiedTreeSessionModel.path;
		const newRoot = "src/fake/new";

		// When.
		await treeService.rename(oldRoot, newRoot);

		// Then.
		const session = await fakeTreeRepository.readTreeSession();
		expect(path.normalize(session.path)).toBe(path.normalize(newRoot));
		const checkPaths = (model: TreeSessionModel) => {
			expect(
				path.normalize(model.path).startsWith(path.normalize(newRoot))
			).toBe(true);
			for (const child of model.children ?? []) {
				checkPaths(child);
			}
		};
		checkPaths(session);
	});

	test("should append suffix with dash and number to avoid duplicate file names", async () => {
		// Given.
		const copiedTreeDto = deepCopyTreeDto(treeDto);
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		await fakeTreeRepository.setTreeSession(copiedTreeDto);
		const prePath = copiedTreeDto.children[0].children[2].path;

		// When.
		const response = await treeService.rename(prePath, prePath);

		// Then.
		expect(response.result).toBe(true);
		const dirName = path.dirname(prePath);
		const expectedBaseName = `test139-2.md`;
		const expectedPath = path.join(dirName, expectedBaseName);
		expect(response.data).toBe(expectedPath);
	});
});

describe("treeService.paste", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeRepository = new FakeTreeRepository(
			treeSessionPath,
			fakeFileManager
		);
		treeService = new TreeService(
			fakeFileManager,
			fakeTreeUtils,
			fakeTreeRepository
		);
	});

	test("should delete original file and copy to new path when clipboardMode is cut", async () => {
		// Given.
		const copiedTreeDto = deepCopyTreeDto(treeDto);
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		const target = copiedTreeDto;
		const childrenToPaste = copiedTreeDto.children[0].children[0].children; // Directory deep.
		const originalPaths = childrenToPaste.map((c) => c.path); // For checking delete with cut mode.

		// When.
		const response = await treeService.paste(target, childrenToPaste, "cut");

		// Then.
		expect(response.result).toBe(true);

		for (const oldPath of originalPaths) {
			const exists = await fakeFileManager.exists(oldPath);
			expect(exists).toBe(false);
		}

		for (const pasted of childrenToPaste) {
			const exists = await fakeFileManager.exists(pasted.path);
			expect(exists).toBe(true);

			const content = await fakeFileManager.read(pasted.path);
			expect(content).toBe(pasted.name);

			expect(pasted.indent).toBe(target.indent + 1);
		}
	});

	test("should rollback all copied files when one fails", async () => {
		// Given
		const copiedTreeDto = { ...treeDto };
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});

		const originalCopy = fakeFileManager.copy.bind(fakeFileManager);
		const failPath = path.join(
			copiedTreeDto.path,
			copiedTreeDto.children[0].children[0].children[0].name
		);
		fakeFileManager.copy = async (src: string, dest: string) => {
			if (dest === failPath) {
				throw new Error("Copy failed");
			}
			return originalCopy(src, dest);
		};

		const target = copiedTreeDto;
		const childrenToPaste = copiedTreeDto.children[0].children[0].children; // Directory deep.
		const originalPaths = childrenToPaste.map((c) => c.path); // For checking delete with cut mode.

		// When
		const response = await treeService.paste(target, childrenToPaste, "cut");

		// Then
		expect(response.result).toBe(false);
		for (const oldPath of originalPaths) {
			const exists = await fakeFileManager.exists(oldPath);
			expect(exists).toBe(true);
		}
		for (const pasted of childrenToPaste) {
			const pastedPath = path.join(target.path, pasted.name);
			const exists = await fakeFileManager.exists(pastedPath);
			expect(exists).toBe(false);
		}
	});

	test("should copy files to new path without deleting original when clipboardMode is copy", async () => {
		// Given.
		const copiedTreeDto = deepCopyTreeDto(treeDto);
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		const target = copiedTreeDto;
		const childrenToPaste = copiedTreeDto.children[0].children[0].children; // Directory deep.
		const originalPaths = childrenToPaste.map((c) => c.path); // For checking original still exists.

		// When.
		const response = await treeService.paste(target, childrenToPaste, "copy");

		// Then.
		expect(response.result).toBe(true);

		for (const oldPath of originalPaths) {
			const exists = await fakeFileManager.exists(oldPath);
			expect(exists).toBe(true);
		}

		for (const pasted of childrenToPaste) {
			const exists = await fakeFileManager.exists(pasted.path);
			expect(exists).toBe(true);

			const content = await fakeFileManager.read(pasted.path);
			expect(content).toBe(pasted.name);

			expect(pasted.indent).toBe(target.indent + 1);
		}
	});

	test("should rollback all copied files when one copy fails in copy mode", async () => {
		// Given
		const copiedTreeDto = deepCopyTreeDto(treeDto);
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});

		const originalCopy = fakeFileManager.copy.bind(fakeFileManager);
		const failPath = path.join(
			copiedTreeDto.path,
			copiedTreeDto.children[0].children[0].children[0].name
		);
		fakeFileManager.copy = async (src: string, dest: string) => {
			if (dest === failPath) {
				throw new Error("Copy failed");
			}
			return originalCopy(src, dest);
		};

		const target = copiedTreeDto;
		const childrenToPaste = copiedTreeDto.children[0].children[0].children;
		const originalPaths = childrenToPaste.map((c) => c.path);

		// When
		const response = await treeService.paste(target, childrenToPaste, "copy");

		// Then
		expect(response.result).toBe(false);
		for (const oldPath of originalPaths) {
			const exists = await fakeFileManager.exists(oldPath);
			expect(exists).toBe(true);
		}
		for (const pasted of childrenToPaste) {
			const pastedPath = path.join(target.path, pasted.name);
			const exists = await fakeFileManager.exists(pastedPath);
			expect(exists).toBe(false);
		}
	});

	test('When "139", "139-1", "139-3" exist, pasting "139" or "139-1" creates "139-2"', async () => {
		// Given
		const copiedTreeDto = deepCopyTreeDto(treeDto);
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		const selectedDtos = [];
		selectedDtos.push(copiedTreeDto.children[0].children[2]); // 139
		// selectedDtos.push(copiedTreeDto.children[0].children[3]) // 139-1
		// selectedDtos.push(copiedTreeDto.children[0].children[4]) // 139-3

		// When.
		const response = await treeService.paste(
			copiedTreeDto,
			selectedDtos,
			"copy"
		);

		// Then.
		expect(response.result).toBe(true);
		expect(response.data[0]).toBe(selectedDtos[0].path);
	});

	test('When "139", "139-1", "139-3" exist, pasting "139" or "139-1" creates "139-2"', async () => {
		// Given
		const copiedTreeDto = deepCopyTreeDto(treeDto);
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		const selectedDtos = [];
		// selectedDtos.push(copiedTreeDto.children[0].children[2]) // 139
		selectedDtos.push(copiedTreeDto.children[0].children[3]); // 139-1
		// selectedDtos.push(copiedTreeDto.children[0].children[4]) // 139-3

		// When.
		const response = await treeService.paste(
			copiedTreeDto,
			selectedDtos,
			"cut"
		);

		// Then.
		expect(response.result).toBe(true);
		expect(response.data[0]).toBe(selectedDtos[0].path);
	});

	test('When "139", "139-1", "139-3" exist, pasting "139" then "139-1" creates "139-2" then "139-4"', async () => {
		// Given
		const copiedTreeDto = deepCopyTreeDto(treeDto);
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		const selectedDtos = [];
		selectedDtos.push(copiedTreeDto.children[0].children[2]); // 139
		selectedDtos.push(copiedTreeDto.children[0].children[3]); // 139-1
		// selectedDtos.push(copiedTreeDto.children[0].children[4]) // 139-3

		// When.
		const response = await treeService.paste(
			copiedTreeDto,
			selectedDtos,
			"cut"
		);

		// Then.
		expect(response.result).toBe(true);
		expect(path.basename(response.data[0])).toBe("test139-2.md");
		expect(path.basename(response.data[1])).toBe("test139-4.md");
	});
});

describe("treeService.create", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeRepository = new FakeTreeRepository(
			treeSessionPath,
			fakeFileManager
		);
		treeService = new TreeService(
			fakeFileManager,
			fakeTreeUtils,
			fakeTreeRepository
		);
	});

	test("should create new file", async () => {
		// Given
		const copiedTreeDto = { ...treeDto };
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		const dir = copiedTreeDto.path;
		const base = "test.md";
		const targetPath = path.join(dir, base);

		// When.
		await treeService.create(targetPath, false);

		// Then.
		const ret = await fakeFileManager.exists(targetPath);
		expect(ret).toBe(true);
	});

	test("should create duplicated new file", async () => {
		// Given
		const copiedTreeDto = { ...treeDto };
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		const dir = copiedTreeDto.path;
		const base = "test139.md";
		const targetPath = path.join(dir, base);

		// When.
		await treeService.create(targetPath, false);

		// Then.
		const ret = await fakeFileManager.exists(path.join(dir, "test139-2.md"));
		expect(ret).toBe(true);
	});

	test("should create new directory", async () => {
		// Given
		const copiedTreeDto = { ...treeDto };
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		const dir = copiedTreeDto.path;
		const base = "test139";
		const targetPath = path.join(dir, base);

		// When.
		await treeService.create(targetPath, true);

		// Then.
		const ret = await fakeFileManager.exists(targetPath);
		expect(ret).toBe(true);
	});

	test("should create duplicated new directory", async () => {
		// Given
		const copiedTreeDto = { ...treeDto };
		traverse(copiedTreeDto, (dto) => {
			fakeFileManager.setPathExistence(dto.path, true);
			fakeFileManager.setFilecontent(dto.path, dto.name);
		});
		const dir = copiedTreeDto.path;
		const base = "dir333";
		const targetPath = path.join(dir, base);

		// When.
		await treeService.create(targetPath, true);

		// Then.
		const ret = await fakeFileManager.exists(path.join(dir, "dir333-1"));
		expect(ret).toBe(true);
	});
});

describe("treeService.syncTreeSessionFromRenderer", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeRepository = new FakeTreeRepository(
			treeSessionPath,
			fakeFileManager
		);
		treeService = new TreeService(
			fakeFileManager,
			fakeTreeUtils,
			fakeTreeRepository
		);
	});

	test("a write session was received from the renderer for synchronization", async () => {
		// Given.
		const copiedDto = deepCopyTreeDto(treeDto);

		// When.
		await treeService.syncTreeSessionFromRenderer(copiedDto);

		// Then.
		const session: TreeSessionModel =
			await fakeTreeRepository.readTreeSession();

		const dtoPaths: string[] = [];
		traverse(copiedDto, (node) => dtoPaths.push(path.normalize(node.path)));

		const sessionPaths: string[] = [];
		traverse(session, (node) => sessionPaths.push(path.normalize(node.path)));

		expect(sessionPaths).toEqual(dtoPaths);
	});
});

describe("treeService.getSyncedTreeSession", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeRepository = new FakeTreeRepository(
			treeSessionPath,
			fakeFileManager
		);
		treeService = new TreeService(
			fakeFileManager,
			fakeTreeUtils,
			fakeTreeRepository
		);
	});

	test("should sync with file system and update tree session", async () => {
		// Given.
		const copiedModel = deepCopyTreeDto(treeSessionModel);
		await fakeTreeRepository.setTreeSession(copiedModel);
		traverse(copiedModel, (model) => {
			fakeFileManager.setPathExistence(model.path, true);
			fakeFileManager.setFilecontent(model.path, model.name);
		});
		const newFilePath = path.join(copiedModel.path, "newFilePath");
		const newFileData = "newFileData";
		fakeFileManager.setPathExistence(newFilePath, true);
		fakeFileManager.setFilecontent(newFilePath, newFileData);
		copiedModel.children.push({
			path: newFilePath,
			name: "newFilePath",
			indent: 1,
			directory: false,
			expanded: false,
			children: null,
		});
		fakeTreeUtils.setTree(copiedModel);

		// // When.
		await treeService.getSyncedTreeSession();

		// // Then.
		const session = await fakeTreeRepository.readTreeSession();
		const hasNewFile = session.children?.some(
			(child) => child.path === newFilePath
		);
		expect(hasNewFile).toBe(true);
	});

	test("should sync with file system and remove deleted file from tree session", async () => {
		// Given.
		const copiedModel = deepCopyTreeDto(treeSessionModel);
		const removedFilePath = copiedModel.children?.[0]?.path;
		if (copiedModel.children && removedFilePath) {
			copiedModel.children = copiedModel.children.filter(
				(child) => child.path !== removedFilePath
			);
		}
		await fakeTreeRepository.setTreeSession(copiedModel);
		traverse(copiedModel, (model) => {
			fakeFileManager.setPathExistence(model.path, true);
			fakeFileManager.setFilecontent(model.path, model.name);
		});
		if (removedFilePath) {
			fakeFileManager.setPathExistence(removedFilePath, false);
		}
		fakeTreeUtils.setTree(copiedModel);

		// When.
		await treeService.getSyncedTreeSession();

		// Then.
		const session = await fakeTreeRepository.readTreeSession();
		const hasRemovedFile = session.children?.some(
			(child) => child.path === removedFilePath
		);
		expect(hasRemovedFile).toBe(false);
	});
});
