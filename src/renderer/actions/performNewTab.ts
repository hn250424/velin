import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/manager/TabEditorManager"
import Response from "@shared/types/Response"

export default async function performNewTab(tabEditorManager: TabEditorManager) {
    const response: Response<number> = await window[electronAPI.channel].newTab()
    if (response.result) await tabEditorManager.addTab(response.data)
}

