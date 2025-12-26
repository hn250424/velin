import { Editor, editorViewCtx, parserCtx, rootCtx } from "@milkdown/kit/core";
import { history } from "@milkdown/kit/plugin/history";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { nord } from "@milkdown/theme-nord";
import "@milkdown/theme-nord/style.css";
import { redo, undo } from "prosemirror-history";
import { injectable } from "inversify";
import {
	CLASS_TAB,
	DATASET_ATTR_TAB_ID,
	MODIFIED_TEXT,
	CLASS_EDITOR_BOX,
	NOT_MODIFIED_TEXT,
	CLASS_TAB_GHOST,
	CLASS_BINARY,
} from "../../constants/dom";
import TabEditorView from "./TabEditorView";
import TabEditorViewModel from "@renderer/viewmodels/TabEditorViewModel";
import { BINARY_FILE_WARNING } from "./TabEditorFacade";

@injectable()
export default class TabEditorRenderer {
	private _tabEditorViews: TabEditorView[] = [];
	private _pathToTabEditorViewMap: Map<string, TabEditorView> = new Map();

	private _ghostTab: HTMLElement | null;
	private _indicator: HTMLElement | null;

	private _tabContainer: HTMLElement;
	private _editorContainer: HTMLElement;

	constructor() {
		this._tabContainer = document.getElementById("tab_container");
		this._editorContainer = document.getElementById("editor_container");
	}

	private createTabBox(fileName: string) {
		const div = document.createElement("div");
		div.classList.add(CLASS_TAB);

		const span = document.createElement("span");
		span.textContent = fileName ? fileName : "Untitled";

		const button = document.createElement("button");
		button.textContent = NOT_MODIFIED_TEXT;

		div.appendChild(span);
		div.appendChild(button);

		return { div, span, button };
	}

	async createTabAndEditor(viewModel: TabEditorViewModel) {
		const { id, isModified, isBinary, filePath, fileName, initialContent } = viewModel;

		const { div, span, button } = this.createTabBox(fileName);
		div.dataset[DATASET_ATTR_TAB_ID] = id.toString();
		span.title = filePath || "";
		this._tabContainer.appendChild(div);

		const editorBox = document.createElement("div");
		editorBox.className = CLASS_EDITOR_BOX;

		let editor = null;

		if (isBinary) {
			editorBox.innerText = BINARY_FILE_WARNING;
			editorBox.classList.add(CLASS_BINARY);
		} else {
			editor = await Editor.make()
				.config((ctx) => {
					ctx.set(rootCtx, editorBox);
					nord(ctx);
				})
				.use(commonmark)
				.use(history)
				.create();
			editor.action((ctx) => {
				const parser = ctx.get(parserCtx);
				const view = ctx.get(editorViewCtx);
				const doc = parser(initialContent);

				// Apply initial content without pushing it to the undo stack.
				const tr = view.state.tr
					.replaceWith(0, view.state.doc.content.size, doc.content)
					.setMeta("addToHistory", false);

				view.dispatch(tr);
			});
		}

		this._editorContainer.appendChild(editorBox);

		const tabEditorView = new TabEditorView(div, span, button, editorBox, editor);

		if (!isBinary) {
			tabEditorView.observeEditor(
				() => {
					const current = tabEditorView.getContent();
					const isModified = current !== viewModel.initialContent;

					if (isModified && !viewModel.isModified) {
						viewModel.isModified = true;
						tabEditorView.setTabButtonTextContent(MODIFIED_TEXT);
					} else if (!isModified && viewModel.isModified) {
						viewModel.isModified = false;
						tabEditorView.setTabButtonTextContent(NOT_MODIFIED_TEXT);
					}
				},
				() => {
					if (!viewModel.filePath && viewModel.isModified) {
						const firstLine = tabEditorView.getEditorFirstLine();
						tabEditorView.setTabSpanTextContent(firstLine || "Untitled");
					}
				}
			);
		}

		this._tabEditorViews.push(tabEditorView);
		this.setTabEditorViewByPath(filePath, tabEditorView);
	}

	removeTabAndEditor(index: number) {
		this._tabEditorViews[index].destroy();
		this._tabEditorViews.splice(index, 1);
	}

	get tabEditorViews(): readonly TabEditorView[] {
		return this._tabEditorViews;
	}

	getTabEditorViewByIndex(index: number) {
		return this._tabEditorViews[index];
	}

	getTabEditorViewIndexById(id: number) {
		return this._tabEditorViews.findIndex((v) => v.getId() === id);
	}

	get pathToTabEditorViewMap(): ReadonlyMap<string, TabEditorView> {
		return this._pathToTabEditorViewMap;
	}

	deleteTabEditorViewByPath(path: string) {
		this._pathToTabEditorViewMap.delete(path);
	}

	getTabEditorViewByPath(path: string) {
		return this._pathToTabEditorViewMap.get(path);
	}

	setTabEditorViewByPath(path: string, tabEditorVeiw: TabEditorView) {
		this._pathToTabEditorViewMap.set(path, tabEditorVeiw);
	}

	undo(index: number) {
		this._tabEditorViews[index].editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const { state, dispatch } = view;
			undo(state, dispatch);
		});
	}

	redo(index: number) {
		this._tabEditorViews[index].editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const { state, dispatch } = view;
			redo(state, dispatch);
		});
	}

	paste(index: number, text: string) {
		this._tabEditorViews[index].editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const { state, dispatch } = view;
			view.focus();
			dispatch(state.tr.insertText(text));
		});
	}

	activateTabEditorByIndex(targetIndex: number, preActiveindex: number) {
		this._tabEditorViews[preActiveindex].setDeactive();
		this._tabEditorViews[targetIndex].setActive();
	}

	moveTabEditorView(fromIndex: number, toIndex: number) {
		const view = this._tabEditorViews.splice(fromIndex, 1)[0];
		this._tabEditorViews.splice(toIndex, 0, view);
		this._tabContainer.removeChild(view.tabBox);
		const refNode = this._tabContainer.children[toIndex] ?? null;
		this._tabContainer.insertBefore(view.tabBox, refNode);
	}

	createGhostBox(fileName: string) {
		if (this._ghostTab) return this._ghostTab;
		const { div, span, button } = this.createTabBox(fileName);
		div.classList.add(CLASS_TAB_GHOST);
		this._ghostTab = div;
		document.body.appendChild(this._ghostTab);
		return div;
	}

	removeGhostBox() {
		if (this._ghostTab) {
			this._ghostTab.remove();
			this._ghostTab = null;
		}
	}

	createIndicator() {
		if (this._indicator) return this._indicator;
		const _indicator = document.createElement("div");
		_indicator.className = "tab-indicator";
		this._indicator = _indicator;
		return this._indicator;
	}

	removeIndicator() {
		if (this._indicator) {
			this._indicator.remove();
			this._indicator = null;
		}
	}

	changeFontSize(baseSize: number) {
		const container = this._editorContainer;
		const setVar = (name: string, value: string) => container.style.setProperty(name, value);

		const scale = {
			spacing: 0.25,
			radiusLg: 0.5,
			sm: 0.875,
			base: 1.0,
			xl: 1.25,
			xl_2: 1.5,
			xl_3: 1.875,
		};

		// Font sizes
		setVar("--text-sm", `${baseSize * scale.sm}px`);
		setVar("--text-base", `${baseSize * scale.base}px`);
		setVar("--text-xl", `${baseSize * scale.xl}px`);
		setVar("--text-2xl", `${baseSize * scale.xl_2}px`);
		setVar("--text-3xl", `${baseSize * scale.xl_3}px`);

		// Line heights
		setVar("--text-sm-line-height", (1.25 / 0.875).toString());
		setVar("--text-base-line-height", "1.5");
		setVar("--text-xl-line-height", (1.75 / 1.25).toString());
		setVar("--text-2xl-line-height", (2 / 1.5).toString());
		setVar("--text-3xl-line-height", (2.25 / 0.875).toString());

		// Etc
		setVar("--spacing", `${baseSize * scale.spacing}px`);
		setVar("--radius-lg", `${baseSize * scale.radiusLg}px`);
	}

	changeFontFamily(family: string) {
		this._editorContainer.style.fontFamily = family;
	}
}
