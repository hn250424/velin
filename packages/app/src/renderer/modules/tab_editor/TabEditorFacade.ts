import "@milkdown/theme-nord/style.css";
import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto";
import { inject, injectable } from "inversify";
import DI_KEYS from "../../constants/di_keys";
import { NOT_MODIFIED_TEXT } from "../../constants/dom";
import TabEditorViewModel from "../../viewmodels/TabEditorViewModel";
import TabEditorRenderer from "./TabEditorRenderer";
import TabEditorStore from "./TabEditorStore";
import TabEditorView from "./TabEditorView";
import TabDragManager from "./TabDragManager";

// export const BINARY_FILE_WARNING = '❌'
export const BINARY_FILE_WARNING = `Can't read this file`;

@injectable()
export default class TabEditorFacade {
	constructor(
		@inject(DI_KEYS.TabEditorRenderer) private readonly renderer: TabEditorRenderer,
		@inject(DI_KEYS.TabEditorStore) private readonly store: TabEditorStore,
		@inject(DI_KEYS.TabDragManager) private readonly drag: TabDragManager
	) {}

	async loadTabs(dto: TabEditorsDto) {
		this.store.activeTabId = dto.activatedId;
		const tabs = dto.data;

		for (let i = 0; i < tabs.length; i++) {
			if (tabs[i].id === this.store.activeTabId) {
				await this.addTab(tabs[i].id, tabs[i].filePath, tabs[i].fileName, tabs[i].content, tabs[i].isBinary, true);
			} else {
				await this.addTab(tabs[i].id, tabs[i].filePath, tabs[i].fileName, tabs[i].content, tabs[i].isBinary, false);
			}
		}
	}

	async syncTabs(dto: TabEditorsDto) {
		this.store.activeTabId = dto.activatedId;
		const tabs = dto.data;

		const map: Map<number, TabEditorDto> = new Map();

		for (const tab of tabs) {
			map.set(tab.id, tab);
		}

		for (const view of this.renderer.tabEditorViews) {
			const id = view.getId();
			const dto = map.get(id);

			if (dto) {
				const viewModel = this.store.getTabEditorViewModelById(id);
				if (dto.filePath !== viewModel.filePath) {
					viewModel.filePath = dto.filePath;
					viewModel.fileName = dto.fileName;

					view.tabSpan.title = dto.filePath;
					view.tabSpan.textContent = this.resolveFileNameByView(view);
				}
			} else {
				this.removeTab(id);
				this.store.deleteTabEditorViewModelById(id);
			}
		}
	}

	async addTab(id = 0, filePath = "", fileName = "", content = "", isBinary = false, activate = true) {
		const vm: TabEditorViewModel = {
			id: id,
			isModified: false,
			isBinary: isBinary,
			filePath: filePath,
			fileName: fileName,
			initialContent: content,
		};

		this.store.setTabEditorViewModelById(id, vm);
		await this.renderer.createTabAndEditor(vm);

		if (activate) {
			this.renderer.tabEditorViews[this.store.activeTabIndex]?.setDeactive();
			this.store.activeTabIndex = this.renderer.tabEditorViews.length - 1;
			this.renderer.tabEditorViews[this.store.activeTabIndex].setActive();
			this.activeTabId = id;
		}
	}

	applySaveResult(result: TabEditorDto) {
		if (result.isBinary) return false;

		let wasApplied = false;
		for (let i = 0; i < this.renderer.tabEditorViews.length; i++) {
			const data = this.getTabEditorViewModelById(this.renderer.tabEditorViews[i].getId());
			if ((data.id === result.id || data.filePath === result.filePath) && result.isModified === false) {
				const tv = this.renderer.tabEditorViews[i];
				const vm = this.store.getTabEditorViewModelById(tv.getId());

				vm.initialContent = result.content;

				tv.setSuppressInputEvent(true);
				const selection = tv.getSelection();
				tv.setContent(result.content);
				tv.setSelection(selection);
				tv.setSuppressInputEvent(false);

				tv.setTabSpanTextContent(result.fileName);
				tv.setTabButtonTextContent(NOT_MODIFIED_TEXT);

				data.isModified = false;
				data.filePath = result.filePath;
				data.fileName = result.fileName;

				wasApplied = true;
			}
		}
		return wasApplied;
	}

	applySaveAllResults(results: TabEditorsDto) {
		results.data.forEach((result, i) => {
			this.applySaveResult(result);
		});
	}

	private removeTabAt(index: number) {
		const view = this.renderer.getTabEditorViewByIndex(index);
		const id = view.getId();
		const viewModel = this.store.getTabEditorViewModelById(id);

		this.renderer.deleteTabEditorViewByPath(viewModel.filePath);
		this.store.deleteTabEditorViewModelById(id);

		this.renderer.removeTabAndEditor(index);
	}

	removeTab(id: number) {
		const views = this.renderer.tabEditorViews;

		for (let i = 0; i < views.length; i++) {
			const view = views[i];
			if (view.getId() === id) {
				const wasActive = this.store.activeTabIndex >= i;

				this.removeTabAt(i);

				if (wasActive || this.store.activeTabIndex > i) {
					this.store.activeTabIndex = Math.max(0, this.activeTabIndex - 1);

					if (views.length > 0) {
						views[this.store.activeTabIndex].setActive();
						this.store.activeTabId = views[this.store.activeTabIndex].getId();
					} else {
						this.store.activeTabId = -1;
					}
				}

				break;
			}
		}
	}

	removeTabsExcept(results: boolean[]) {
		for (let i = this.renderer.tabEditorViews.length - 1; i >= 0; i--) {
			if (results[i]) this.removeTabAt(i);
		}

		const idx = this.renderer.tabEditorViews.findIndex((view) => view.getId() === this.activeTabId);
		if (idx === -1) this.setLastTabAsActive();
		else this.activeTabIndex = idx;
	}

	removeTabsToRight(results: boolean[]) {
		for (let i = this.renderer.tabEditorViews.length - 1; i >= 0; i--) {
			if (results[i]) this.removeTabAt(i);
		}

		const idx = this.renderer.tabEditorViews.findIndex((view) => view.getId() === this.activeTabId);
		if (idx === -1) this.setLastTabAsActive();
		else this.activeTabIndex = idx;
	}

	removeAllTabs(results: boolean[]) {
		for (let i = this.renderer.tabEditorViews.length - 1; i >= 0; i--) {
			if (results[i]) this.removeTabAt(i);
		}

		const idx = this.renderer.tabEditorViews.findIndex((view) => view.getId() === this.activeTabId);
		if (idx === -1) this.setLastTabAsActive();
		else this.activeTabIndex = idx;
	}

	private setLastTabAsActive() {
		const views = this.renderer.tabEditorViews;
		const lastIdx = views.length - 1;

		this.store.activeTabIndex = lastIdx;
		this.store.activeTabId = lastIdx >= 0 ? views[lastIdx].getId() : -1;

		views[lastIdx]?.setActive();
	}

	async rename(prePath: string, newPath: string, isDir: boolean) {
		if (isDir) {
			for (const [filePath, view] of this.renderer.pathToTabEditorViewMap.entries()) {
				const relative = window.utils.getRelativePath(prePath, filePath);
				if (relative === "" || (!relative.startsWith("..") && !window.utils.isAbsolute(relative))) {
					const newFilePath = window.utils.getJoinedPath(newPath, relative);
					const preData = this.getTabEditorDataByView(view);
					const newData = { ...preData, filePath: newFilePath };
					const viewModel = this.toTabEditorViewModel(newData);

					this.store.setTabEditorViewModelById(viewModel.id, viewModel);
					this.renderer.deleteTabEditorViewByPath(filePath);
					this.renderer.setTabEditorViewByPath(newFilePath, view);

					view.tabSpan.title = viewModel.filePath;
				}
			}

			const dto = this.getAllTabEditorData();
			await window.rendererToMain.syncTabSessionFromRenderer(dto);
		} else {
			const view = this.getTabEditorViewByPath(prePath);
			const viewModel = this.getTabEditorViewModelById(view.getId());
			viewModel.filePath = newPath;
			viewModel.fileName = window.utils.getBaseName(newPath);

			this.renderer.deleteTabEditorViewByPath(prePath);
			this.renderer.setTabEditorViewByPath(viewModel.filePath, view);

			view.tabSpan.title = viewModel.filePath;
			view.tabSpan.textContent = viewModel.fileName ? viewModel.fileName : "Untitled";

			const dto = this.getAllTabEditorData();
			await window.rendererToMain.syncTabSessionFromRenderer(dto);
		}
	}

	activateTabEditorById(id: number) {
		const targetIndex = this.renderer.getTabEditorViewIndexById(id);
		const preActiveindex = this.store.activeTabIndex;

		this.renderer.activateTabEditorByIndex(targetIndex, preActiveindex);

		this.store.activeTabId = id;
		this.store.activeTabIndex = targetIndex;
	}

	moveTabEditorViewAndUpdateActiveIndex(fromIndex: number, toIndex: number): void {
		if (fromIndex === toIndex) return;

		this.renderer.moveTabEditorView(fromIndex, toIndex);

		if (this.store.activeTabIndex === fromIndex) {
			this.store.activeTabIndex = toIndex;
		} else if (fromIndex < this.store.activeTabIndex && toIndex >= this.store.activeTabIndex) {
			this.store.activeTabIndex--;
		} else if (fromIndex > this.store.activeTabIndex && toIndex <= this.store.activeTabIndex) {
			this.store.activeTabIndex++;
		}
	}

	private resolveFileNameByView(view: TabEditorView): string {
		const id = view.getId();
		const data = this.getTabEditorViewModelById(id);

		if (!data.fileName) return view.getEditorFirstLine();
		else return data.fileName;
	}

	private getTabEditorDataByView(view: TabEditorView): TabEditorDto {
		const id = view.getId();
		const data = this.getTabEditorViewModelById(id);

		return {
			id: data.id,
			isModified: data.isModified,
			filePath: data.filePath,
			fileName: this.resolveFileNameByView(view),
			content: data.isBinary ? BINARY_FILE_WARNING : view.getContent(),
			isBinary: data.isBinary,
		};
	}

	getTabEditorDataById(id: number): TabEditorDto {
		const viewModel = this.store.getTabEditorViewModelById(id);
		const view = this.renderer.getTabEditorViewByPath(viewModel.filePath);
		if (!view) return null;
		return this.getTabEditorDataByView(view);
	}

	getActiveTabEditorData(): TabEditorDto {
		const activeIndex = this.store.activeTabIndex;
		const view = this.renderer.getTabEditorViewByIndex(activeIndex);
		return this.getTabEditorDataByView(view);
	}

	getAllTabEditorData(): TabEditorsDto {
		return {
			activatedId: this.store.activeTabId,
			data: this.renderer.tabEditorViews.map((view) => this.getTabEditorDataByView(view)),
		};
	}

	toTabEditorViewModel(dto: TabEditorDto): TabEditorViewModel {
		return this.store.toTabEditorViewModel(dto);
	}

	getTabEditorViewModelById(id: number) {
		return this.store.getTabEditorViewModelById(id);
	}

	setTabEditorViewModelById(id: number, viewModel: TabEditorViewModel) {
		this.store.setTabEditorViewModelById(id, viewModel);
	}

	get activeTabId() {
		return this.store.activeTabId;
	}

	set activeTabId(id: number) {
		this.store.activeTabId = id;
	}

	get activeTabIndex() {
		return this.store.activeTabIndex;
	}

	set activeTabIndex(index: number) {
		this.store.activeTabIndex = index;
	}

	get contextTabId() {
		return this.store.contextTabId;
	}

	set contextTabId(id: number) {
		this.store.contextTabId = id;
	}

	removeContextTabId() {
		this.store.removeContextTabId();
	}

	getActiveTabEditorView(): TabEditorView {
		const activeIndex = this.store.activeTabIndex;
		return this.renderer.getTabEditorViewByIndex(activeIndex);
	}

	getTabEditorViewByPath(path: string) {
		return this.renderer.getTabEditorViewByPath(path);
	}

	setTabEditorViewByPath(path: string, tabEditorVeiw: TabEditorView) {
		this.renderer.setTabEditorViewByPath(path, tabEditorVeiw);
	}

	getTabEditorViewByIndex(index: number) {
		return this.renderer.getTabEditorViewByIndex(index);
	}

	getTabEditorViewIndexById(id: number) {
		return this.renderer.getTabEditorViewIndexById(id);
	}

	deleteTabEditorViewByPath(path: string) {
		this.renderer.deleteTabEditorViewByPath(path);
	}

	undo() {
		const activeTabIndex = this.store.activeTabIndex;
		this.renderer.undo(activeTabIndex);
	}

	redo() {
		const activeTabIndex = this.store.activeTabIndex;
		this.renderer.redo(activeTabIndex);
	}

	paste(text: string) {
		const activeTabIndex = this.store.activeTabIndex;
		this.renderer.paste(activeTabIndex, text);
	}

	createGhostBox(fileName: string) {
		return this.renderer.createGhostBox(fileName);
	}

	removeGhostBox() {
		this.renderer.removeGhostBox();
	}

	createIndicator() {
		return this.renderer.createIndicator();
	}

	removeIndicator() {
		this.renderer.removeIndicator();
	}

	changeFontSize(size: number) {
		this.renderer.changeFontSize(size);
	}

	changeFontFamily(family: string) {
		this.renderer.changeFontFamily(family);
	}

	isMouseDown(): boolean {
		return this.drag.isMouseDown();
	}

	setMouseDown(state: boolean) {
		this.drag.setMouseDown(state);
	}

	isDrag(): boolean {
		return this.drag.isDrag();
	}

	setTargetElement(tab: HTMLElement) {
		return this.drag.setTargetElement(tab);
	}

	getTabs() {
		return this.drag.getTabs();
	}

	setTabs(tabs: HTMLElement[]) {
		this.drag.setTabs(tabs);
	}

	startDrag() {
		this.drag.startDrag();
	}

	endDrag() {
		this.drag.endDrag();
	}

	getStartPosition() {
		return this.drag.getStartPosition();
	}

	setStartPosition(x: number, y: number) {
		this.drag.setStartPosition(x, y);
	}

	getStartPosition_x() {
		return this.drag.getStartPosition_x();
	}

	getStartPosition_y() {
		return this.drag.getStartPosition_y();
	}

	getDragTargetTab() {
		return this.drag.getDragTargetTab();
	}

	getDragTargetTabId() {
		return this.drag.getDragTargetTabId();
	}

	setDragTargetTabId(id: number) {
		this.drag.setDragTargetTabId(id);
	}

	getDragTargetTabName() {
		return this.drag.getDragTargetTabName();
	}

	setDragTargetTabName(name: string) {
		this.drag.setDragTargetTabName(name);
	}

	getInsertIndex(): number | null {
		return this.drag.getInsertIndex();
	}

	setInsertIndex(index: number) {
		this.drag.setInsertIndex(index);
	}
}
