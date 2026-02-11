import "@milkdown/theme-nord/style.css";
import { serializerCtx } from "@milkdown/core";
import { Editor, editorViewCtx, parserCtx } from "@milkdown/kit/core";

import { TextSelection, Selection } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { Plugin, PluginKey } from "prosemirror-state";

import { CLASS_SELECTED, DATASET_ATTR_TAB_ID } from "../../constants/dom";

type SearchMatch = {
	from: number;
	to: number;
};

type SearchState = {
	query: string;
	matches: SearchMatch[];
	currentIndex: number;
};

export default class TabEditorView {
	private _editor: Editor | null;
	private _tabBox: HTMLElement;
	private _tabSpan: HTMLElement;
	private _tabButton: HTMLElement;
	private _editorBox: HTMLElement;

	private _suppressInputEvent = false;

	private _searchState: SearchState | null = null;
	private _searchHighlightKey = new PluginKey("searchHighlight");

	private _onEditorInputCallback?: () => void;

	constructor(
		tabBox: HTMLElement,
		tabSpan: HTMLElement,
		tabButton: HTMLElement,
		editorBox: HTMLElement,
		editor: Editor | null
	) {
		this._tabBox = tabBox;
		this._tabSpan = tabSpan;
		this._tabButton = tabButton;
		this._editorBox = editorBox;
		this._editor = editor;
	}

	getId(): number {
		return parseInt(this._tabBox.dataset[DATASET_ATTR_TAB_ID]!, 10);
	}

	observeEditor(onInput: () => void, onBlur: () => void) {
		this._onEditorInputCallback = onInput;

		this._editor!.action((ctx) => {
			const view = ctx.get(editorViewCtx);

			view.setProps({
				dispatchTransaction: (tr) => {
					const newState = view.state.apply(tr);
					view.updateState(newState);

					if (tr.docChanged) {
						if (this._suppressInputEvent) return;
						onInput();
					}
				},
				handleDOMEvents: {
					blur: () => {
						onBlur();
						return false;
					},
				},
			});
		});
	}

	getEditorFirstLine() {
		const editorView = this._editor!.ctx.get(editorViewCtx);
		const firstLine = editorView.state.doc.textBetween(0, editorView.state.doc.content.size).split("\n")[0].trim();

		return firstLine || "Untitled";
	}

	getContent(): string {
		let content = "";
		this._editor!.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const serializer = ctx.get(serializerCtx);
			content = serializer(view.state.doc);
		});
		return content;
	}

	setContent(content: string): void {
		this._editor!.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const parser = ctx.get(parserCtx);
			const doc = parser(content);

			if (doc) {
				const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content);
				view.dispatch(tr);
			}
		});
	}

	getSelection() {
		return this._editor!.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const sel = view.state.selection;

			return {
				anchor: sel.anchor,
				head: sel.head,
			};
		});
	}

	setSelection(sel: { anchor: number; head: number }) {
		return this._editor!.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const state = view.state;

			const maxPos = state.doc.content.size;
			const safeAnchor = Math.max(0, Math.min(sel.anchor, maxPos));

			try {
				const resolvedPos = state.doc.resolve(safeAnchor);
				const newSel = Selection.near(resolvedPos);

				const tr = state.tr.setSelection(newSel);
				view.dispatch(tr);
			} catch (e) {
				console.warn("Selection placement failed:", e);
			}
		});
	}

	focus() {
		this._editor!.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			view.focus();
		});
	}

	destroy() {
		this._editor?.destroy();
		this._editorBox.remove();
		this._tabBox.remove();
	}

	setActive() {
		this._editorBox.classList.add(CLASS_SELECTED);
		this._tabBox.classList.add(CLASS_SELECTED);
		this.focus();
	}

	setDeactive() {
		this._editorBox.classList.remove(CLASS_SELECTED);
		this._tabBox.classList.remove(CLASS_SELECTED);
	}

	setTabSpanTextContent(text: string) {
		this._tabSpan.textContent = text;
	}

	setTabButtonTextContent(text: string) {
		this._tabButton.textContent = text;
	}

	findMatches(searchText: string): SearchMatch[] {
		const view = this._editor!.ctx.get(editorViewCtx);
		const { doc } = view.state;

		const matches: { from: number; to: number }[] = [];

		if (!searchText || !searchText.trim()) {
			return matches;
		}

		doc.descendants((node, pos) => {
			if (node.isText) {
				const text = node.text ?? "";
				let index = text.indexOf(searchText);
				while (index !== -1) {
					matches.push({
						from: pos + index,
						to: pos + index + searchText.length,
					});
					index = text.indexOf(searchText, index + searchText.length);
				}
			}
			return true;
		});

		return matches;
	}

	updateSearchState(state: SearchState) {
		this._searchState = state;
	}

	applySearchHighlight(view: EditorView) {
		const state = view.state;

		const searchHighlightPlugin = new Plugin({
			key: this._searchHighlightKey,
			state: {
				init: () => DecorationSet.empty,
				apply: (tr, old, _oldState, newState) => old.map(tr.mapping, newState.doc),
			},
			props: {
				decorations: () => {
					if (!this._searchState?.matches.length) return null;

					const decorations = this._searchState?.matches.map((match, idx) =>
						Decoration.inline(match.from, match.to, {
							class: idx === this._searchState?.currentIndex ? "search-highlight-current" : "search-highlight",
						})
					);

					return DecorationSet.create(state.doc, decorations);
				},
			},
		});

		const plugins = state.plugins.filter((p) => p.spec.key !== this._searchHighlightKey);

		const newState = state.reconfigure({
			plugins: [...plugins, searchHighlightPlugin],
		});

		view.updateState(newState);
	}

	replaceCurrent(searchText: string, replaceText: string): boolean {
		if (!this._searchState) return false;

		const { matches, currentIndex } = this._searchState;
		if (currentIndex < 0 || currentIndex >= matches.length) return false;

		let replaced = false;

		this._editor!.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const state = view.state;
			const { from, to } = matches[currentIndex];

			let tr = state.tr.replaceWith(from, to, state.schema.text(replaceText));

			const cursorPos = tr.mapping.map(from) + replaceText.length;
			tr = tr.setSelection(TextSelection.create(tr.doc, cursorPos));

			view.dispatch(tr);
			replaced = true;
		});

		if (replaced) this.markAsModified();
		return replaced;
	}

	replaceAll(searchText: string, replaceText: string): number {
		if (!searchText) return 0;

		let replacedCount = 0;

		this._editor!.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const state = view.state;
			const parser = ctx.get(parserCtx);
			const serializer = ctx.get(serializerCtx);
			const content = serializer(state.doc);
			const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
			const newContent = content.replace(regex, () => {
				replacedCount++;
				return replaceText;
			});

			if (newContent !== content) {
				const newDoc = parser(newContent);
				if (newDoc) {
					const tr = state.tr.replaceWith(0, state.doc.content.size, newDoc.content);
					view.dispatch(tr);
				}

				this.markAsModified();
			}
		});

		return replacedCount;
	}

	markAsModified() {
		if (this._onEditorInputCallback) {
			this._onEditorInputCallback();
		}
	}

	clearSearch() {
		const view = this._editor!.ctx.get(editorViewCtx);
		const plugins = view.state.plugins.filter((p) => p.spec.key !== this._searchHighlightKey);
		const newState = view.state.reconfigure({ plugins });
		view.updateState(newState);
		this._searchState = null;
	}

	get searchState() {
		return this._searchState;
	}

	setSuppressInputEvent(value: boolean) {
		this._suppressInputEvent = value;
	}

	shouldSuppressInputEvent(): boolean {
		return this._suppressInputEvent;
	}

	get editor(): Editor | null {
		return this._editor;
	}

	get tabBox(): HTMLElement {
		return this._tabBox;
	}

	get tabSpan() {
		return this._tabSpan;
	}

	get tabButton() {
		return this._tabButton;
	}

	get editorBox() {
		return this._editorBox;
	}
}
