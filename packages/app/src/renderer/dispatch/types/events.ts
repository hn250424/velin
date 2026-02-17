import type { SettingsViewModel } from "@renderer/viewmodels/SettingsViewModel"
import type { Focus } from "../../core/types"
import type { Source } from "."

type DispatchEventSchema = {
	[F in Focus | "default"]?: {
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
	openDirectory: {
		default: {
			default: [treeNode?: HTMLElement]
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
	closeTab: {
		default: {
			default: [id: number]
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

	applySettings: {
		none: {
			default: [viewModel: SettingsViewModel]
		}
	}
	applyAndSaveSettings: {
		default: {
			default: [viewModel: SettingsViewModel]
		}
	}

	//

	toggleFindReplace: {
		default: {
			default: [replace: boolean]
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
}>

export type GetArgs<E extends keyof DispatchEventsWithArgs> =
	DispatchEventsWithArgs[E][keyof DispatchEventsWithArgs[E]] extends infer SNode
		? SNode extends Partial<Record<Source | "default", any[]>>
			? SNode[keyof SNode]
			: []
		: []
