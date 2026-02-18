import { inject, injectable } from "inversify"
import type { Focus } from "../core"
import { FocusManager } from "../core"
import DI_KEYS from "../constants/di_keys"
import { CommandManager } from "../modules"
import { assert } from "../utils"
import type { DispatchEventsWithArgs, GetArgs, Source } from "./types"
import type { SettingsViewModel } from "@renderer/viewmodels/SettingsViewModel"

@injectable()
export class Dispatcher {
	private readonly _handlers: {
		[E in keyof DispatchEventsWithArgs]: Partial<
			Record<Focus | "default", Partial<Record<Source | "default", (...args: any[]) => void | Promise<void>>>>
		>
	}

	constructor(
		@inject(DI_KEYS.FocusManager) private readonly focusManager: FocusManager,
		@inject(DI_KEYS.CommandManager) private readonly commandManager: CommandManager
	) {
		this._handlers = {
			//

			undo: {
				editor: {
					shortcut: () => {
						/* intentional no-op */
					},
					default: async () => await this.commandManager.performUndoEditor(),
				},
				tree: { default: async () => await this.commandManager.performUndoTree() },
			},
			redo: {
				editor: {
					shortcut: () => {
						/* intentional no-op */
					},
					default: async () => await this.commandManager.performRedoEditor(),
				},
				tree: { default: async () => await this.commandManager.performRedoTree() },
			},

			//

			newTab: { default: { default: async () => await this.commandManager.performNewTab() } },
			openFile: { default: { default: (path) => this.commandManager.performOpenFile(path) } },
			openDirectory: { default: { default: (node) => this.commandManager.performOpenDirectory(node) } },
			save: { default: { default: async () => await this.commandManager.performSave() } },
			saveAs: { default: { default: async () => await this.commandManager.performSaveAs() } },
			saveAll: { default: { default: async () => await this.commandManager.performSaveAll() } },

			//

			closeTab: {
				default: {
					default: (id: number) => this.commandManager.performCloseTab(id),
				},
			},
			closeOtherTabs: {
				default: {
					default: () => this.commandManager.performCloseOtherTabs(),
				},
			},
			closeTabsToRight: {
				default: {
					default: () => this.commandManager.performCloseTabsToRight(),
				},
			},
			closeAllTabs: {
				default: {
					default: () => this.commandManager.performCloseAllTabs(),
				},
			},

			//

			create: {
				default: {
					default: (directory: boolean) => this.commandManager.performCreate(directory),
				},
			},
			rename: {
				default: {
					default: async () => await this.commandManager.performRename(),
				},
			},
			delete: {
				default: {
					default: async () => await this.commandManager.performDelete(),
				},
			},

			//

			cut: {
				editor: {
					shortcut: async () => await this.commandManager.performCutEditor(),
					default: async () => await this.commandManager.performCutEditorManual(),
				},
				tree: { default: async () => await this.commandManager.performCutTree() },
			},
			copy: {
				editor: {
					shortcut: () => {
						/* intentional no-op */
					},
					default: async () => await this.commandManager.performCopyEditor(),
				},
				tree: { default: async () => await this.commandManager.performCopyTree() },
			},
			paste: {
				editor: {
					shortcut: async () => await this.commandManager.performPasteEditor(),
					default: async () => await this.commandManager.performPasteEditorManual(),
				},
				tree: {
					"context-menu": async () => await this.commandManager.performPasteTreeWithContextmenu(),
					shortcut: async () => await this.commandManager.performPasteTreeWithShortcut(),
					drag: async () => await this.commandManager.performPasteTreeWithDrag(),
				},
			},

			//

			toggleFindReplace: {
				default: {
					default: (replace) => this.commandManager.toggleFindReplaceBox(replace),
				},
			},
			find: {
				default: {
					default: (direction: "up" | "down") => this.commandManager.performFind(direction),
				},
			},
			replace: {
				default: {
					default: async () => await this.commandManager.performReplace(),
				},
			},
			replaceAll: {
				default: {
					default: async () => await this.commandManager.performReplaceAll(),
				},
			},
			closeFindReplace: {
				default: {
					default: async () => await this.commandManager.performCloseFindReplaceBox(),
				},
			},

			//

			applySettings: {
				none: {
					default: (viewModel: SettingsViewModel) => this.commandManager.performApplySettings(viewModel),
				},
			},
			applyAndSaveSettings: {
				default: {
					default: (viewModel: SettingsViewModel) => this.commandManager.performApplyAndSaveSettings(viewModel),
				},
			},

			//

			esc: {
				default: {
					default: async () => await this.commandManager.performESC(),
				},
			},
			enter: {
				default: {
					default: async () => await this.commandManager.performENTER(),
				},
			},
		}
	}

	async dispatch<E extends keyof DispatchEventsWithArgs>(event: E, source: Source, ...args: GetArgs<E>) {
		const focus = this.focusManager.getFocus()

		const eventNode = this._handlers[event]
		assert(eventNode, `Missing event: ${event}`)

		const focusNode = eventNode[focus] || eventNode["default"]
		assert(focusNode, `Missing focus node: ${event} > ${focus}`)

		const handler = focusNode[source] || focusNode["default"]
		assert(handler, `Missing handler: ${event} > ${focus} > ${source}`)

		await handler(...args)
	}
}
