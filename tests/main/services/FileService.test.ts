import FileService from "@services/FileService";
import { TabEditorDto } from "@shared/dto/TabEditorDto";
import { beforeEach, describe, expect, test, vi } from "vitest";
import FakeMainWindow from "../mocks/FakeMainWindow";
import FakeFileManager from "../modules/fs/FakeFileManager";
import fakeDialogManager, {
	setFakeOpenFileDialogResult,
	setFakeOpenDirectoryDialogResult,
	setFakeSaveDialogResult,
} from "../modules/ui/fakeDialogManager";
import FakeTabRepository from "../modules/tab/FakeTabRepository";
import FakeTreeRepository from "../modules/tree/FakeTreeRepository";
import FakeTreeUtils from "../modules/tree/FakeTreeUtils";
import FakeFileWatcher from "../modules/fs/FakeFileWatcher";

import {
	tabSessionPath,
	treeSessionPath,
	newFilePath,
	emptyFilePathTabEditorDto,
	defaultTabEditorDto,
	tabEidtorsDto,
	treeDto,
} from "../data/test_data";
import path from "path";

let fakeFileManager: FakeFileManager;
let fakeTabRepository: FakeTabRepository;
let fakeTreeUtils: FakeTreeUtils;
let fakeTreeRepository: FakeTreeRepository;
let fakeFileWatcher: FakeFileWatcher;
let fileService: FileService;
const fakeMainWindow = new FakeMainWindow();

describe("FileService.newTab", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeFileWatcher = new FakeFileWatcher();
		fileService = new FileService(
			fakeFileManager,
			fakeTabRepository,
			fakeDialogManager,
			fakeTreeRepository,
			fakeTreeUtils,
			fakeFileWatcher
		);
	});

	test("should create a new tab with an incremented ID based on the existing session", async () => {
		// Given.
		fakeFileManager.setPathExistence(tabSessionPath, true);
		await fakeTabRepository.setTabSession({
			activatedId: -1,
			data: [{ id: 5, filePath: "file.md" }],
		});

		// When.
		const id = await fileService.newTab();

		// Then.
		expect(id).toBe(6);
		const session = await fakeTabRepository.readTabSession();
		expect(session.data.length).toBe(2);
		expect(session.data[1].id).toBe(6);
	});
});

describe("FileService.openFile", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeFileWatcher = new FakeFileWatcher();
		fileService = new FileService(
			fakeFileManager,
			fakeTabRepository,
			fakeDialogManager,
			fakeTreeRepository,
			fakeTreeUtils,
			fakeFileWatcher
		);
	});

	test("should return false when the open dialog is canceled", async () => {
		// Given.
		setFakeOpenFileDialogResult({ canceled: true, filePaths: [] });

		// When.
		const result = await fileService.openFile();

		// Then.
		expect(result).toBe(null);
	});

	test("should open a file and return its path and content", async () => {
		// Given.
		setFakeOpenFileDialogResult({ canceled: false, filePaths: ["openPath"] });
		fakeFileManager.setFilecontent("openPath", "content");
		fakeTabRepository.setTabSession({
			activatedId: 0,
			data: [
				{ id: 0, filePath: "path1" },
				{ id: 1, filePath: "path2" },
			],
		});

		// When.
		const data = await fileService.openFile();

		// Then.
		expect(data.filePath).toBe("openPath");
		expect(data.content).toBe("content");
		const session = await fakeTabRepository.readTabSession();
		expect(session.activatedId).toBe(2);
		expect(session.data.length).toBe(3);
		expect(session.data[2].filePath).toBe("openPath");
	});

	test("should return correct response when called with path arg", async () => {
		// Given.
		fakeFileManager.setFilecontent("testPath", "testContent");
		fakeTabRepository.setTabSession({
			activatedId: 0,
			data: [
				{ id: 0, filePath: "path1" },
				{ id: 1, filePath: "path2" },
			],
		});

		// When.
		const response = await fileService.openFile("testPath");

		// Then.
		expect(response.content).toBe("testContent");
		expect(response.id).toBe(2);
		const session = await fakeTabRepository.readTabSession();
		expect(session.activatedId).toBe(2);
		expect(session.data[2].filePath).toBe("testPath");
	});
});

describe("FileService.openDirectory", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeTreeRepository = new FakeTreeRepository(
			treeSessionPath,
			fakeFileManager
		);
		fakeFileWatcher = new FakeFileWatcher();
		fileService = new FileService(
			fakeFileManager,
			fakeTabRepository,
			fakeDialogManager,
			fakeTreeRepository,
			fakeTreeUtils,
			fakeFileWatcher
		);
	});

	test("should return correctly updated root tree without dto", async () => {
		// Given.
		const copiedDto = { ...treeDto };
		fakeTreeUtils.setTree(copiedDto);
		setFakeOpenDirectoryDialogResult({
			canceled: false,
			filePaths: [copiedDto.path],
		});

		// When.
		const response = await fileService.openDirectory();

		// Then.
		expect(response).toEqual(copiedDto);
		const session = await fakeTreeRepository.readTreeSession();
		expect(response.path).toEqual(session.path);
	});

	test("should return correctly updated children tree without dto", async () => {
		// Given.
		const copiedDto = { ...treeDto };
		fakeTreeUtils.setTree(copiedDto);
		fakeTreeRepository.setTreeSession(copiedDto);
		setFakeOpenDirectoryDialogResult({
			canceled: false,
			filePaths: [copiedDto.path],
		});

		// When.
		const response = await fileService.openDirectory();

		// Then.
		expect(response.path).toBe(copiedDto.path);
		const session = await fakeTreeRepository.readTreeSession();
		expect(response.path).toBe(session.path);
	});

	test("should return the correctly updated root tree when opening the root dto", async () => {
		// Given.
		const copiedDto = { ...treeDto };
		fakeTreeUtils.setTree(copiedDto);

		// When.
		const response = await fileService.openDirectory(copiedDto);

		// Then.
		expect(response).toEqual(copiedDto);
		const session = await fakeTreeRepository.readTreeSession();
		expect(response.path).toEqual(session.path);
	});

	test("should return the correctly updated child tree and mark it as expanded when opening a child dto", async () => {
		// Given.
		const copiedDto = { ...treeDto };
		fakeTreeUtils.setTree(copiedDto);
		fakeTreeRepository.setTreeSession(copiedDto);

		// When.
		const response = await fileService.openDirectory(copiedDto.children[1]);

		// Then.
		expect(response.path).toBe(
			path.join(copiedDto.path, copiedDto.children[1].name)
		);
		const session = await fakeTreeRepository.readTreeSession();
		expect(response.path).toBe(session.children[1].path);
		expect(session.children[1].expanded).toBe(true);
	});
});

describe("FileService.save", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeFileWatcher = new FakeFileWatcher();
		fileService = new FileService(
			fakeFileManager,
			fakeTabRepository,
			fakeDialogManager,
			fakeTreeRepository,
			fakeTreeUtils,
			fakeFileWatcher
		);
	});

	test("Save with empty filePath and cancel dialog", async () => {
		// Given.
		const data: TabEditorDto = { ...emptyFilePathTabEditorDto };

		setFakeSaveDialogResult({
			canceled: true,
			filePath: "",
		});

		// When.
		const result: TabEditorDto = await fileService.save(
			data,
			fakeMainWindow as any
		);

		// Then.
		expect(result.isModified).toBe(true);
	});

	test("Save with empty filePath and confirmed dialog", async () => {
		// Given.
		const data: TabEditorDto = { ...emptyFilePathTabEditorDto };
		setFakeSaveDialogResult({
			canceled: false,
			filePath: newFilePath,
		});
		fakeFileManager.setPathExistence(tabSessionPath, true);
		await fakeTabRepository.setTabSession({
			activatedId: 1,
			data: [{ id: data.id, filePath: data.filePath }],
		});

		// When.
		const response = await fileService.save(data, fakeMainWindow as any);

		// Then.
		expect(response.isModified).toBe(false);
		expect(await fakeFileManager.read(newFilePath)).toBe(data.content);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data[0].id).toBe(0);
		expect(tabSession.data[0].filePath).toBe(newFilePath);
	});

	test("Save with filePath", async () => {
		// Given.
		const data = { ...defaultTabEditorDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		await fakeTabRepository.setTabSession({
			activatedId: 1,
			data: [{ id: data.id, filePath: data.filePath }],
		});

		// When.
		const response = await fileService.save(data, fakeMainWindow as any);

		// Then.
		expect(response.isModified).toBe(false);
		expect(await fakeFileManager.read(data.filePath)).toBe(data.content);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data[0].id).toBe(0);
		expect(tabSession.data[0].filePath).toBe(data.filePath);
	});
});

describe("FileService.saveAs", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeFileWatcher = new FakeFileWatcher();
		fileService = new FileService(
			fakeFileManager,
			fakeTabRepository,
			fakeDialogManager,
			fakeTreeRepository,
			fakeTreeUtils,
			fakeFileWatcher
		);
	});

	test("should return false when SaveDialog is canceled", async () => {
		// Given.
		const data = { ...defaultTabEditorDto };
		setFakeSaveDialogResult({
			canceled: true,
			filePath: "",
		});

		// When.
		const response = await fileService.saveAs(data, fakeMainWindow as any);

		// Then.
		expect(response).toBe(null);
	});

	test("should save file and update tabSession when SaveDialog returns path", async () => {
		// Given.
		const data = { ...defaultTabEditorDto };
		setFakeSaveDialogResult({
			canceled: false,
			filePath: newFilePath,
		});
		fakeFileManager.setPathExistence(tabSessionPath, true);
		await fakeTabRepository.setTabSession({
			activatedId: 1,
			data: [{ id: data.id, filePath: data.filePath }],
		});

		// When.
		const response = await fileService.saveAs(data, fakeMainWindow as any);

		// Then.
		expect(response.isModified).toBe(false);
		const savedFile = await fakeFileManager.read(newFilePath);
		expect(savedFile).toBe(data.content);
		const updatedTabSession = await fakeTabRepository.readTabSession();
		expect(updatedTabSession.data[updatedTabSession.data.length - 1].id).toBe(
			data.id + 1
		);
		expect(
			updatedTabSession.data[updatedTabSession.data.length - 1].filePath
		).toBe(newFilePath);
	});
});

describe("FileService.saveAll", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTreeUtils = new FakeTreeUtils(fakeFileManager);
		fakeFileWatcher = new FakeFileWatcher();
		fileService = new FileService(
			fakeFileManager,
			fakeTabRepository,
			fakeDialogManager,
			fakeTreeRepository,
			fakeTreeUtils,
			fakeFileWatcher
		);
	});

	test("test all cases with confirmed dialog", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeSaveDialogResult({
			canceled: false,
			filePath: newFilePath,
		});
		await fakeTabRepository.setTabSession({
			activatedId: copiedDto.activatedId,
			data: copiedDto.data.map(({ id, filePath }) => ({ id, filePath })),
		});
		const spy = vi.spyOn(fakeFileManager, "write");

		// When.
		const response = await fileService.saveAll(
			copiedDto,
			fakeMainWindow as any
		);

		// Then.
		const session = await fakeTabRepository.readTabSession();
		expect(session.data[0].filePath).toBe("");
		expect(session.data[1].filePath).toBe(copiedDto.data[1].filePath);
		const file_2 = await fakeFileManager.read(copiedDto.data[2].filePath);
		expect(file_2).toBe(copiedDto.data[2].content);
		expect(response.data[2].isModified).toBe(false);
		const file_3 = await fakeFileManager.read(newFilePath);
		expect(file_3).toBe(copiedDto.data[3].content);
		expect(response.data[3].isModified).toBe(false);
		expect(session.data[3].filePath).toBe(newFilePath);
		expect(spy).toHaveBeenCalledTimes(3);
	});

	test("test all cases with cancel dialog", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeSaveDialogResult({
			canceled: true,
			filePath: "",
		});
		await fakeTabRepository.setTabSession({
			activatedId: copiedDto.activatedId,
			data: copiedDto.data.map(({ id, filePath }) => ({ id, filePath })),
		});
		const spy = vi.spyOn(fakeFileManager, "write");

		// When.
		const response = await fileService.saveAll(
			copiedDto,
			fakeMainWindow as any
		);

		// Then.
		const session = await fakeTabRepository.readTabSession();
		expect(session.data[0].filePath).toBe("");
		expect(session.data[1].filePath).toBe(copiedDto.data[1].filePath);
		const file_2 = await fakeFileManager.read(copiedDto.data[2].filePath);
		expect(file_2).toBe(copiedDto.data[2].content);
		expect(response.data[2].isModified).toBe(false);
		expect(response.data[3].isModified).toBe(true);
		expect(session.data[3].filePath).toBe("");
		expect(spy).toHaveBeenCalledTimes(2);
	});
});
