import type { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TreeFacade from "../modules/tree/TreeFacade"

export default function registerExitHandlers(tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
	document.querySelectorAll(".exit").forEach((dom) => {
		dom.addEventListener("click", () => {
			const tabEditorDto: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
			const treeViewModel = treeFacade.extractTreeViewModel()
			const treeSessionData = treeViewModel ? treeFacade.toTreeDto(treeViewModel) : null
			window.rendererToMain.exit(tabEditorDto, treeSessionData)
		})
	})
}
