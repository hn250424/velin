import SideDto from '@shared/dto/SideDto'
import TreeDto from '../../dto/TreeDto'
import { TabEditorsDto } from '@shared/dto/TabEditorDto'
import WindowDto from '@shared/dto/WindowDto'
import SettingsDto from '@shared/dto/SettingsDto'

export default interface MainToRendererAPI {
    session: (callback: (windowDto: WindowDto, settingsDto: SettingsDto, sideDto: SideDto, tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => void) => void
    syncFromWatch: (callback: (tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => void) => void
    onMaximizeWindow: (callback: () => void) => void
    onUnmaximizeWindow: (callback: () => void) => void
}