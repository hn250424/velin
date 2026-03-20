import type { SettingsViewModel } from "@renderer/viewmodels/SettingsViewModel"
import type { Task } from "../../core"
import type { Source } from "./index"

type DispatchEventSchema = {
	[T in Task | "default"]?: {
		[S in Source | "default"]?: any[]
	}
}

type EnforceSchema<T extends Record<string, DispatchEventSchema>> = T

export type DispatchEventsWithArgs = EnforceSchema<{
	//

	undo: {
		editor: {
			shortcut: []
			default: []
		}
		tree: {
			default: []
		}
	}
	redo: {
		editor: {
			shortcut: []
			default: []
		}
		tree: {
			default: []
		}
	}

	//

	newTab: {
		default: {
			default: []
		}
	}
	openFile: {
		default: {
			default: [filePath?: string]
		}
	}
	openDirectoryByDialog: {
		default: {
			default: []
		}
	}
	openDirectoryByTreeNode: {
		default: {
			default: [treeNode: HTMLElement]
		}
	}
	save: {
		default: {
			default: []
		}
	}
	saveAs: {
		default: {
			default: []
		}
	}
	saveAll: {
		default: {
			default: []
		}
	}

	//

	closeTab: {
		default: {
			default: [id: number]
		}
	}
	closeOtherTabs: {
		tab: {
			default: []
		}
	}
	closeTabsToRight: {
		tab: {
			default: []
		}
	}
	closeAllTabs: {
		tab: {
			default: []
		}
	}

	//

	create: {
		tree: {
			default: [directory: boolean]
		}
	}
	rename: {
		tree: {
			default: []
		}
	}
	delete: {
		tree: {
			default: []
		}
	}

	//

	cut: {
		editor: {
			shortcut: []
			default: []
		}
		tree: {
			default: []
		}
	}
	copy: {
		editor: {
			shortcut: []
			default: []
		}
		tree: {
			default: []
		}
	}
	paste: {
		editor: {
			shortcut: []
			default: []
		}
		tree: {
			"context-menu": []
			shortcut: []
			drag: []
		}
	}

	//

	toggleFindReplace: {
		default: {
			default: [replace: boolean]
		}
	}
	searchQueryChanged: {
		default: {
			menu: [query: string]
		}
	}
	replaceQueryChanged: {
		default: {
			menu: [query: string]
		}
	}
	find: {
		default: {
			default: [direction: "up" | "down"]
		}
	}
	replace: {
		default: {
			default: []
		}
	}
	replaceAll: {
		default: {
			default: []
		}
	}
	closeFindReplace: {
		default: {
			default: []
		}
	}

	//

	applySettings: {
		none: {
			programmatic: [viewModel: SettingsViewModel]
		}
	}
	applyAndSaveSettings: {
		default: {
			default: [viewModel: SettingsViewModel]
		}
	}

	//

	esc: {
		"find-replace": {
			shortcut: []
		}
		editor: {
			shortcut: []
		}
		default: {
			shortcut: []
		}
	}
	enter: {
		"find-replace": {
			shortcut: []
		}
		tree: {
			shortcut: []
		}
		default: {
			shortcut: []
		}
	}
}>

export type GetArgs<E extends keyof DispatchEventsWithArgs> =
	DispatchEventsWithArgs[E][keyof DispatchEventsWithArgs[E]] extends infer SNode
		? SNode extends Partial<Record<Source | "default", any[]>>
			? SNode[keyof SNode]
			: []
		: []
