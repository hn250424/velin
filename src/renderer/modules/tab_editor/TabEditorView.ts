import { serializerCtx } from "@milkdown/core";
import { Editor, editorViewCtx, parserCtx } from "@milkdown/kit/core";
import "@milkdown/theme-nord/style.css";
import { CLASS_SELECTED, DATASET_ATTR_TAB_ID } from "../../constants/dom";
import { TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Plugin, PluginKey } from "prosemirror-state";

export default class TabEditorView {
	private _editor: Editor;
	private _tabBox: HTMLElement;
	private _tabSpan: HTMLElement;
	private _tabButton: HTMLElement;
	private _editorBox: HTMLElement;

	private suppressInputEvent = false;

	private searchHighlightKey = new PluginKey("searchHighlight");
	private searchResults: { from: number; to: number }[] = [];
	private currentSearchIndex = -1;

	private onEditorInputCallback?: () => void;

	constructor(
		tabBox: HTMLElement,
		tabSpan: HTMLElement,
		tabButton: HTMLElement,
		editorBox: HTMLElement,
		editor: Editor
	) {
		this._tabBox = tabBox;
		this._tabSpan = tabSpan;
		this._tabButton = tabButton;
		this._editorBox = editorBox;
		this._editor = editor;
	}

	getId(): number {
		return parseInt(this._tabBox.dataset[DATASET_ATTR_TAB_ID], 10);
	}

	observeEditor(onInput: () => void, onBlur: () => void) {
		this.onEditorInputCallback = onInput;

		this._editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);

			view.setProps({
				dispatchTransaction: (tr) => {
					const newState = view.state.apply(tr);
					view.updateState(newState);

					if (tr.docChanged) {
						if (this.suppressInputEvent) return;
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
		const editorView = this._editor.ctx.get(editorViewCtx);
		const firstLine = editorView.state.doc.textBetween(0, editorView.state.doc.content.size).split("\n")[0].trim();

		return firstLine || "Untitled";
	}

	getContent(): string {
		let content = "";
		this._editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const serializer = ctx.get(serializerCtx);
			content = serializer(view.state.doc);
		});
		return content;
	}

	setContent(content: string): void {
		this._editor.action((ctx) => {
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
		return this._editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const sel = view.state.selection;

			return {
				anchor: sel.anchor,
				head: sel.head,
			};
		});
	}

	setSelection(sel: { anchor: number; head: number }) {
		return this._editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const state = view.state;
			const newSel = TextSelection.create(state.doc, sel.anchor, sel.head);
			const tr = state.tr.setSelection(newSel);
			view.dispatch(tr);
		});
	}

	focus() {
		this._editor.action((ctx) => {
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

	findMatches(searchText: string): { from: number; to: number }[] {
		const view = this._editor.ctx.get(editorViewCtx);
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

	findAndSelect(searchText: string, direction: "up" | "down"): { total: number; current: number } | null {
		const view = this._editor.ctx.get(editorViewCtx);
		const state = view.state;
		const currentPos = state.selection.from;

		this.searchResults = this.findMatches(searchText);

		if (this.searchResults.length === 0) return null;

		let targetIndex = -1;

		// Find next/previous match based on current cursor position
		// and wrap to first or last match with direction if none found after cursor.
		if (direction === "down") {
			targetIndex = this.searchResults.findIndex((match) => match.from > currentPos);
			if (targetIndex === -1) {
				targetIndex = 0;
			}
		} else {
			for (let i = this.searchResults.length - 1; i >= 0; i--) {
				if (this.searchResults[i].to <= currentPos) {
					targetIndex = i;
					break;
				}
			}
			if (targetIndex === -1) {
				targetIndex = this.searchResults.length - 1;
			}
		}

		this.currentSearchIndex = targetIndex;

		const match = this.searchResults[targetIndex];
		const tr = state.tr.setSelection(TextSelection.create(state.doc, match.from, match.to));

		const searchHighlightPlugin = new Plugin({
			key: this.searchHighlightKey,
			state: {
				init: () => DecorationSet.empty,
				apply: (tr, old, _oldState, newState) => old.map(tr.mapping, newState.doc),
			},
			props: {
				decorations: (state) => {
					if (!this.searchResults.length) return null;
					const decorations = this.searchResults.map((match, idx) =>
						Decoration.inline(match.from, match.to, {
							class: idx === this.currentSearchIndex ? "search-highlight-current" : "search-highlight",
						})
					);
					return DecorationSet.create(state.doc, decorations);
				},
			},
		});

		const plugins = state.plugins.filter((p) => p.spec.key !== this.searchHighlightKey);
		const newState = state.reconfigure({
			plugins: [...plugins, searchHighlightPlugin],
		});

		view.updateState(newState);
		view.dispatch(tr);

		return {
			total: this.searchResults.length,
			current: this.currentSearchIndex + 1,
		};
	}

	clearSearch() {
		const view = this._editor.ctx.get(editorViewCtx);
		const plugins = view.state.plugins.filter((p) => p.spec.key !== this.searchHighlightKey);
		const newState = view.state.reconfigure({ plugins });
		view.updateState(newState);

		this.searchResults = [];
		this.currentSearchIndex = -1;
	}

	replaceCurrent(searchText: string, replaceText: string): boolean {
		if (!searchText) return false;
		if (this.currentSearchIndex < 0 || this.currentSearchIndex >= this.searchResults.length) return false;

		let replaced = false;

		this._editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const state = view.state;
			const match = this.searchResults[this.currentSearchIndex];
			const { from, to } = match;
			const tr = state.tr.replaceWith(from, to, state.schema.text(replaceText));
			view.dispatch(tr);
			replaced = true;
		});

		if (replaced) {
			this.markAsModified();
		}

		return replaced;
	}

	replaceAll(searchText: string, replaceText: string): number {
		if (!searchText) return 0;

		let replacedCount = 0;

		this._editor.action((ctx) => {
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
		if (this.onEditorInputCallback) {
			this.onEditorInputCallback();
		}
	}

	setSuppressInputEvent(value: boolean) {
		this.suppressInputEvent = value;
	}

	shouldSuppressInputEvent(): boolean {
		return this.suppressInputEvent;
	}

	get editor(): Editor {
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
