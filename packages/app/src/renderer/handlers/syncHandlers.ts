import type { TabEditorFacade, TreeFacade } from "@renderer/modules"
import type { TabEditorsDto } from "@shared/dto/TabEditorDto"
import type { TreeDto, TreePartialUpdate } from "@shared/dto/TreeDto"

export function handleSync(tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
	window.mainToRenderer.syncFromWatch(
		async (
			tabEditorsDto: TabEditorsDto,
			treeDto: TreeDto,
			partialUpdates?: TreePartialUpdate[]
		) => {
			if (tabEditorsDto) {
				await tabEditorFacade.syncTabs(tabEditorsDto)
			}

			if (partialUpdates) {
				for (const update of partialUpdates) {
					if (update.type === "add") {
						const parentPath = window.utils.getDirName(update.path)
						treeFacade.applyCreate(parentPath, update.path, update.isDirectory)
					} else if (update.type === "remove") {
						const idx = treeFacade.getFlattenIndexByPath(update.path)
						if (idx !== undefined) {
							treeFacade.applyDelete([idx])
						}
					}
				}

				// After partial updates, sync the updated state back to Main
				// to keep the session file in sync with what the renderer is showing.
				const viewModel = treeFacade.getRootTreeViewModel()
				const currentTreeDto = treeFacade.toTreeDto(viewModel)
				await window.rendererToMain.syncTreeSessionFromRenderer(currentTreeDto)
			} else if (treeDto) {
				const viewModel = treeFacade.toTreeViewModel(treeDto)

				treeFacade.clearPathToTreeWrapper() // Must clear map manually before render (no built-in clear).
				treeFacade.render(viewModel)

				treeFacade.removeLastSelectedIndex()
				treeFacade.clearSelectedIndices()
				treeFacade.clearClipboardPaths()
				treeFacade.setRootTreeViewModel(viewModel)
			}
		}
	)
}
