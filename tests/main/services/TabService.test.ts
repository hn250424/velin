import { TabEditorDto } from "@shared/dto/TabEditorDto";
import { beforeEach, describe, expect, test, vi } from "vitest";
import FakeMainWindow from "../mocks/FakeMainWindow";
import FakeFileManager from "../modules/fs/FakeFileManager";
import fakeDialogManager, { setFakeConfirmResult, setFakeSaveDialogResult } from "../modules/ui/fakeDialogManager";
import FakeTabRepository from "../modules/tab/FakeTabRepository";
import TabService from "@services/TabService";

import {
	tabSessionPath,
	newFilePath,
	emptyFilePathTabEditorDto,
	defaultTabEditorDto,
	tabEidtorsDto,
} from "../data/test_data";
import FakeTabUtils from "../modules/tab/FakeTabUtils";

let fakeFileManager: FakeFileManager;
let fakeTabRepository: FakeTabRepository;
let fakeTabUtils: FakeTabUtils;
let tabService: TabService;
const fakeMainWindow = new FakeMainWindow();

describe("tabService.closeTab", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabUtils = new FakeTabUtils(fakeFileManager);
		tabService = new TabService(fakeFileManager, fakeTabRepository, fakeTabUtils, fakeDialogManager);
	});

	test("should write when closeTab if data is modified", async () => {
		// Given.
		const data = { ...defaultTabEditorDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(true);
		fakeTabRepository.setTabSession({
			activatedId: data.id,
			data: [{ id: data.id, filePath: data.filePath }],
		});

		// When.
		const response = await tabService.closeTab(data, fakeMainWindow as any);

		// Then.
		expect(response).toBe(true);
		const session = await fakeTabRepository.readTabSession();
		expect(session.data.length).toBe(0);
		const file = await fakeFileManager.read(data.filePath);
		expect(file).toBe(data.content);
	});

	test("should remove without saving if user cancels confirm on modified data", async () => {
		// Given.
		const data = { ...defaultTabEditorDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(false);
		await fakeTabRepository.setTabSession({
			activatedId: data.id,
			data: [{ id: data.id, filePath: data.filePath }],
		});

		// When.
		const response = await tabService.closeTab(data, fakeMainWindow as any);

		// Then.
		expect(response).toBe(true);
		const session = await fakeTabRepository.readTabSession();
		expect(session.data.length).toBe(0);
	});

	test("should save to new path and remove session when closing modified data", async () => {
		// Given.
		const data = { ...emptyFilePathTabEditorDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(true);
		setFakeSaveDialogResult({
			canceled: false,
			filePath: newFilePath,
		});
		await fakeTabRepository.setTabSession({
			activatedId: data.id,
			data: [{ id: data.id, filePath: data.filePath }],
		});

		// When.
		const response = await tabService.closeTab(data, fakeMainWindow as any);

		// Then.
		expect(response).toBe(true);
		const session = await fakeTabRepository.readTabSession();
		expect(session.data.length).toBe(0);
		const file = await fakeFileManager.read(newFilePath);
		expect(file).toBe(data.content);
	});

	test("should remain in the program when save dialog is canceled during closeTab", async () => {
		// Given.
		const data = { ...emptyFilePathTabEditorDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(true);
		setFakeSaveDialogResult({
			canceled: true,
			filePath: "",
		});
		await fakeTabRepository.setTabSession({
			activatedId: data.id,
			data: [{ id: data.id, filePath: data.filePath }],
		});

		// When.
		const response = await tabService.closeTab(data, fakeMainWindow as any);

		// Then.
		expect(response).toBe(false);
		const session = await fakeTabRepository.readTabSession();
		expect(session.data.length).toBe(1);
	});

	test("should just remove session when closeTab if data is not modified", async () => {
		// Given.
		const data = { ...defaultTabEditorDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		await fakeTabRepository.setTabSession({
			activatedId: data.id,
			data: [{ id: data.id, filePath: data.filePath }],
		});

		// When.
		const response = await tabService.closeTab(data, fakeMainWindow as any);

		// Then.
		expect(response).toBe(true);
		const session = await fakeTabRepository.readTabSession();
		expect(session.data.length).toBe(0);
	});
});

describe("tabService.closeTabsExcept", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabUtils = new FakeTabUtils(fakeFileManager);
		tabService = new TabService(fakeFileManager, fakeTabRepository, fakeTabUtils, fakeDialogManager);
	});

	test("should retain only selected tab and save others modified file", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(true);
		setFakeSaveDialogResult({
			canceled: false,
			filePath: newFilePath,
		});
		await fakeTabRepository.setTabSession({
			activatedId: copiedDto.activatedId,
			data: copiedDto.data.map(({ id, filePath }) => ({ id, filePath })),
		});
		const spy = vi.spyOn(fakeFileManager, "write");
		const exceptData: TabEditorDto = copiedDto.data[1];

		// When.
		const response = await tabService.closeTabsExcept(exceptData, copiedDto, fakeMainWindow as any);

		// Then.
		expect(spy).toHaveBeenCalledTimes(3);
		expect(await fakeFileManager.read(newFilePath)).toBe(copiedDto.data[3].content);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data.length).toBe(1);
		expect(tabSession.data[0].id).toBe(exceptData.id);
		expect(tabSession.data[0].filePath).toBe(exceptData.filePath);
	});

	test("should retain only the selected tab when user declines to save", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(false);
		setFakeSaveDialogResult({
			canceled: true,
			filePath: "",
		});
		await fakeTabRepository.setTabSession({
			activatedId: copiedDto.activatedId,
			data: copiedDto.data.map(({ id, filePath }) => ({ id, filePath })),
		});
		const spy = vi.spyOn(fakeFileManager, "write");
		const exceptData: TabEditorDto = copiedDto.data[1];

		// When.
		const response = await tabService.closeTabsExcept(exceptData, copiedDto, fakeMainWindow as any);

		// Then.
		expect(spy).toHaveBeenCalledTimes(1);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data.length).toBe(1);
		expect(tabSession.data[0].id).toBe(exceptData.id);
		expect(tabSession.data[0].filePath).toBe(exceptData.filePath);
	});

	test("should keep selected tab and tabs with canceled save dialog after confirm", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(true);
		setFakeSaveDialogResult({
			canceled: true,
			filePath: "",
		});
		await fakeTabRepository.setTabSession({
			activatedId: copiedDto.activatedId,
			data: copiedDto.data.map(({ id, filePath }) => ({ id, filePath })),
		});
		for (const { filePath } of copiedDto.data) {
			fakeFileManager.setFilecontent(filePath, "dummy");
		}
		const spy = vi.spyOn(fakeFileManager, "write");
		const exceptData: TabEditorDto = copiedDto.data[1];

		// When.
		const response = await tabService.closeTabsExcept(exceptData, copiedDto, fakeMainWindow as any);

		// Then.
		expect(spy).toHaveBeenCalledTimes(2);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data.length).toBe(2);
		expect(tabSession.data[0].id).toBe(exceptData.id);
		expect(tabSession.data[0].filePath).toBe(exceptData.filePath);
		expect(await fakeFileManager.read(copiedDto.data[2].filePath)).toBe(copiedDto.data[2].content);
	});
});

describe("tabService.closeTabsToRight", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabUtils = new FakeTabUtils(fakeFileManager);
		tabService = new TabService(fakeFileManager, fakeTabRepository, fakeTabUtils, fakeDialogManager);
	});

	test("should retain only the tabs to the left of the reference tab and save modified files", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(true);
		setFakeSaveDialogResult({
			canceled: false,
			filePath: newFilePath,
		});
		await fakeTabRepository.setTabSession({
			activatedId: copiedDto.activatedId,
			data: copiedDto.data.map(({ id, filePath }) => ({ id, filePath })),
		});
		const spy = vi.spyOn(fakeFileManager, "write");
		const refData: TabEditorDto = copiedDto.data[1];

		// When.
		const response = await tabService.closeTabsToRight(refData, copiedDto, fakeMainWindow as any);

		// Then.
		expect(spy).toHaveBeenCalledTimes(3);
		expect(await fakeFileManager.read(newFilePath)).toBe(copiedDto.data[3].content);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data.length).toBe(2);
		expect(tabSession.data[tabSession.data.length - 1].id).toBe(refData.id);
		expect(tabSession.data[tabSession.data.length - 1].filePath).toBe(refData.filePath);
	});

	test("should retain only the tabs to the left of the reference tab when user decline to save", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(false);
		setFakeSaveDialogResult({
			canceled: true,
			filePath: "",
		});
		await fakeTabRepository.setTabSession({
			activatedId: copiedDto.activatedId,
			data: copiedDto.data.map(({ id, filePath }) => ({ id, filePath })),
		});
		const spy = vi.spyOn(fakeFileManager, "write");
		const refData: TabEditorDto = copiedDto.data[1];

		// When.
		const response = await tabService.closeTabsToRight(refData, copiedDto, fakeMainWindow as any);

		// Then.
		expect(spy).toHaveBeenCalledTimes(1);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data.length).toBe(2);
		expect(tabSession.data[tabSession.data.length - 1].id).toBe(refData.id);
		expect(tabSession.data[tabSession.data.length - 1].filePath).toBe(refData.filePath);
	});

	test("should retain left tabs and right tabs if user cancels save dialog after confirming to save", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(true);
		setFakeSaveDialogResult({
			canceled: true,
			filePath: "",
		});
		await fakeTabRepository.setTabSession({
			activatedId: copiedDto.activatedId,
			data: copiedDto.data.map(({ id, filePath }) => ({ id, filePath })),
		});
		for (const { filePath } of copiedDto.data) {
			fakeFileManager.setFilecontent(filePath, "dummy");
		}
		const spy = vi.spyOn(fakeFileManager, "write");
		const refData: TabEditorDto = copiedDto.data[1];

		// When.
		await tabService.closeTabsToRight(refData, copiedDto, fakeMainWindow as any);

		// Then.
		expect(spy).toHaveBeenCalledTimes(2);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data.length).toBe(3);
		expect(tabSession.data[tabSession.data.length - 1].id).toBe(copiedDto.data[3].id);
		expect(tabSession.data[tabSession.data.length - 1].filePath).toBe(copiedDto.data[3].filePath);
		expect(await fakeFileManager.read(copiedDto.data[2].filePath)).toBe(copiedDto.data[2].content);
	});
});

describe("tabService.closeAllTabs", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabUtils = new FakeTabUtils(fakeFileManager);
		tabService = new TabService(fakeFileManager, fakeTabRepository, fakeTabUtils, fakeDialogManager);
	});

	test("should close all tabs and save modified files", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(true);
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
		const response = await tabService.closeAllTabs(copiedDto, fakeMainWindow as any);

		// Then.
		expect(spy).toHaveBeenCalledTimes(3);
		expect(await fakeFileManager.read(newFilePath)).toBe(copiedDto.data[3].content);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data.length).toBe(0);
	});

	test("should close all tabs when user declines to save", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(false);
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
		const response = await tabService.closeAllTabs(copiedDto, fakeMainWindow as any);

		// Then.
		expect(spy).toHaveBeenCalledTimes(1);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data.length).toBe(0);
	});

	test("should retain tab if user confirms save but cancels save dialog", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };
		fakeFileManager.setPathExistence(tabSessionPath, true);
		setFakeConfirmResult(true);
		setFakeSaveDialogResult({
			canceled: true,
			filePath: "",
		});
		await fakeTabRepository.setTabSession({
			activatedId: copiedDto.activatedId,
			data: copiedDto.data.map(({ id, filePath }) => ({ id, filePath })),
		});
		for (const { filePath } of copiedDto.data) {
			fakeFileManager.setFilecontent(filePath, "dummy");
		}
		const spy = vi.spyOn(fakeFileManager, "write");

		// When.
		await tabService.closeAllTabs(copiedDto, fakeMainWindow as any);

		// Then.
		expect(spy).toHaveBeenCalledTimes(2);
		const tabSession = await fakeTabRepository.readTabSession();
		expect(tabSession.data.length).toBe(1);
		expect(await fakeFileManager.read(copiedDto.data[2].filePath)).toBe(copiedDto.data[2].content);
	});
});

describe("tabService.syncTabSession", () => {
	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeTabRepository = new FakeTabRepository(tabSessionPath, fakeFileManager);
		fakeTabUtils = new FakeTabUtils(fakeFileManager);
		tabService = new TabService(fakeFileManager, fakeTabRepository, fakeTabUtils, fakeDialogManager);
	});

	test("a write session was received from the renderer for synchronization", async () => {
		// Given.
		const copiedDto = { ...tabEidtorsDto };

		// When.
		await tabService.syncTabSession(copiedDto);

		// Then.
		const session = await fakeTabRepository.readTabSession();
		const dtoToSessionData = copiedDto.data.map((d) => {
			return {
				id: d.id,
				filePath: d.filePath,
			};
		});
		expect(dtoToSessionData).toEqual(session.data);
		expect(copiedDto.activatedId).toBe(session.activatedId);
	});
});
