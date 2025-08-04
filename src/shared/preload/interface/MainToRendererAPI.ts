import TreeDto from '../../dto/TreeDto'
import { TabEditorsDto } from '@shared/dto/TabEditorDto'

export default interface MainToRendererAPI {
    session: (callback: (tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => void) => void
    syncFromWatch: (callback: (tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => void) => void
    onMaximizeWindow: (callback: () => void) => void
    onUnmaximizeWindow: (callback: () => void) => void
}