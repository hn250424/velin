import TreeDto from '../../dto/TreeDto'
import { TabEditorsDto } from '@shared/dto/TabEditorDto'

export default interface MainToRendererAPI {
    session: (callback: (tabs: TabEditorsDto, tree: TreeDto) => void) => void
    onMaximizeWindow: (callback: () => void) => void
    onUnmaximizeWindow: (callback: () => void) => void
}