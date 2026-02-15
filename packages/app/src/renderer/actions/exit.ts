import type TabEditorFacade from "@renderer/modules/tab_editor/TabEditorFacade"
import type TreeFacade from "@renderer/modules/tree/TreeFacade"
import type { TabEditorsDto } from "@shared/dto/TabEditorDto"

export function exit(tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
	const tabEditorDto: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
	const treeViewModel = treeFacade.extractTreeViewModel()
	const treeSessionData = treeFacade.toTreeDto(treeViewModel)
	window.rendererToMain.exit(tabEditorDto, treeSessionData)
}
