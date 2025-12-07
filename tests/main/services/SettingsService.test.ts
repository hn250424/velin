import { beforeEach, describe, expect, test } from "vitest";
import FakeFileManager from "../modules/fs/FakeFileManager";
import SettingsDto from "@shared/dto/SettingsDto";
import SettingsService from "@main/services/SettingsService";
import FakeSettingsRepository from "../modules/settings/FakeSettingsRepository";
import FakeSettingsUtils from "../modules/settings/FakeSettingsUtils";

import { settingsSessionPath } from "../data/test_data";

describe("SettingsService.syncSettingsSession", () => {
	const settingsDto: SettingsDto = {
		settingFontDto: {
			size: 16,
		},
		settingThemeDto: {},
	};

	let fakeFileManager: FakeFileManager;
	let fakeSettingsRepository: FakeSettingsRepository;
	let fakeSettingsUtils: FakeSettingsUtils;
	let settingsService: SettingsService;

	beforeEach(() => {
		fakeFileManager = new FakeFileManager();
		fakeSettingsRepository = new FakeSettingsRepository(
			settingsSessionPath,
			fakeFileManager
		);
		fakeSettingsUtils = new FakeSettingsUtils(fakeFileManager);
		settingsService = new SettingsService(
			fakeFileManager,
			fakeSettingsUtils,
			fakeSettingsRepository
		);
	});

	test("a write session was received from the renderer for synchronization", async () => {
		// Given.
		const copiedSettingsDto = { ...settingsDto };

		// When.
		await settingsService.syncSettingsSession(copiedSettingsDto);

		// Then.
		const session = await fakeSettingsRepository.readSettingsSession();
		expect(session.settingFontSessionModel.size).toBe(
			copiedSettingsDto.settingFontDto.size
		);
	});
});
