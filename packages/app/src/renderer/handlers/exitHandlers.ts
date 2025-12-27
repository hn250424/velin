import type { TabEditorsDto } from "@shared/dto/TabEditorDto";
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade";
import TreeFacade from "../modules/tree/TreeFacade";

export default function registerExitHandlers(tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
	document.querySelectorAll(".exit").forEach((dom) => {
		dom.addEventListener("click", () => {
			const tabSessionData: TabEditorsDto = tabEditorFacade.getAllTabEditorData();
			const vm = treeFacade.extractTreeViewModel();
			const treeSessionData = vm ? treeFacade.toTreeDto(vm) : null;
			window.rendererToMain.exit(tabSessionData, treeSessionData);
		});
	});
}
