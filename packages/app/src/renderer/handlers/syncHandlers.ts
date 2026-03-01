import type { TabEditorFacade, TreeFacade } from "@renderer/modules"
import type { TabEditorsDto } from "@shared/dto/TabEditorDto"
import type { TreeDto } from "@shared/dto/TreeDto"

export function handleSync(tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
	window.mainToRenderer.syncFromWatch(async (tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => {
		if (tabEditorsDto) {
			await tabEditorFacade.syncTabs(tabEditorsDto)
		}

		if (treeDto) {
			const viewModel = treeFacade.toTreeViewModel(treeDto)

			treeFacade.clearPathToTreeWrapper() // Must clear map manually before render (no built-in clear).
			treeFacade.render(viewModel)

			treeFacade.removeLastSelectedIndex()
			treeFacade.clearSelectedIndices()
			treeFacade.clearClipboardPaths()
			treeFacade.loadFlattenArrayAndMaps(viewModel)
		}
	})
}
