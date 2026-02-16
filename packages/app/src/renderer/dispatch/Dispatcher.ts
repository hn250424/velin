import { inject, injectable } from "inversify"
import type { Focus } from "../core/types"
import FocusManager from "../core/FocusManager"
import DI_KEYS from "../constants/di_keys"
import type CommandManager from "../modules/CommandManager"
import { assert } from "../utils"
import type { DispatchEventsWithArgs, GetArgs, Source } from "./types"
import type { SettingsViewModel } from "@renderer/viewmodels/SettingsViewModel"

@injectable()
export class Dispatcher {
	private readonly _handlers: {
		[E in keyof DispatchEventsWithArgs]: Partial<
			Record<
				Focus | "default",
				Partial<Record<Source | "default", (...args: any[]) => void | Promise<void>>>
			>
		>
	}

	constructor(
		@inject(DI_KEYS.FocusManager) private readonly focusManager: FocusManager,
		@inject(DI_KEYS.CommandManager) private readonly commandManager: CommandManager
	) {
		this._handlers = {
			//

			newTab: { default: { default: () => this.commandManager.performNewTab() } },
			openFile: { default: { default: (path) => this.commandManager.performOpenFile(path) } },
			openDirectory: { default: { default: (node) => this.commandManager.performOpenDirectory(node) } },
			save: { default: { default: () => this.commandManager.performSave() } },
			saveAs: { default: { default: () => this.commandManager.performSaveAs() } },
			saveAll: { default: { default: () => this.commandManager.performSaveAll() } },

			//

			undo: {
				editor: {
					shortcut: () => {
						/* intentional no-op */
					},
					default: () => this.commandManager.performUndoEditor(),
				},
				tree: { default: () => this.commandManager.performUndoTree() },
			},
			redo: {
				editor: {
					shortcut: () => {
						/* intentional no-op */
					},
					default: () => this.commandManager.performRedoEditor(),
				},
				tree: { default: () => this.commandManager.performRedoTree() },
			},
			cut: {
				editor: {
					shortcut: () => this.commandManager.performCutEditor(),
					default: () => this.commandManager.performCutEditorManual(),
				},
				tree: { default: () => this.commandManager.performCutTree() },
			},
			copy: {
				editor: {
					shortcut: () => {
						/* intentional no-op */
					},
					default: () => this.commandManager.performCopyEditor(),
				},
				tree: { default: () => this.commandManager.performCopyTree() },
			},
			paste: {
				editor: {
					shortcut: () => this.commandManager.performPasteEditor(),
					default: () => this.commandManager.performPasteEditorManual(),
				},
				tree: {
					"context-menu": () => this.commandManager.performPasteTreeWithContextmenu(),
					shortcut: () => this.commandManager.performPasteTreeWithShortcut(),
					drag: () => this.commandManager.performPasteTreeWithDrag(),
				},
			},
			toggleFindReplace: {
				default: {
					default: (replace) => this.commandManager.toggleFindReplaceBox(replace)
				}
			},
			replaceAll: {
				default: {
					default: () => this.commandManager.performReplaceAll()
				}
			},

			//

			applySettings: {
				none: {
					default: (viewModel: SettingsViewModel) => this.commandManager.performApplySettings(viewModel)
				}
			},
			applyAndSaveSettings: {
				default: {
					default: (viewModel: SettingsViewModel) => this.commandManager.performApplyAndSaveSettings(viewModel)
				}
			}


		}
	}

	async dispatch<E extends keyof DispatchEventsWithArgs>(event: E, source: Source, ...args: GetArgs<E>) {
		const focus = this.focusManager.getFocus()!

		const eventNode = this._handlers[event]
		assert(eventNode, `Missing event: ${event}`)

		const focusNode = eventNode[focus] || eventNode["default"]
		assert(focusNode, `Missing focus node: ${event} > ${focus}`)

		const handler = focusNode[source] || focusNode["default"]
		assert(handler, `Missing handler: ${event} > ${focus} > ${source}`);

		await handler(...args)
	}
}

