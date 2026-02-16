export type DispatchEventsWithArgs = {
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
	toggleFindReplace: {
		default: {
			default: [replace: boolean]
		}
	}
	replaceAll: {
		default: {
			default: []
		}
	}
}
