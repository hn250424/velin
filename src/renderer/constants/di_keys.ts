const DI_KEYS = {
    FocusManager: Symbol('FocusManager'),
    FindReplaceState: Symbol('FindReplaceState'),
    SideState: Symbol('SideState'),
    WindowLayoutManager: Symbol('WindowLayoutManager'),

    ZoomManager: Symbol('ZoomManager'),

    ShortcutRegistry: Symbol('ShortcutRegistry'),
    
    TabEditorFacade: Symbol('TabEditorFacade'),
    TabEditorRenderer: Symbol('TabEditorRenderer'),
    TabEditorStore: Symbol('TabEditorStore'),
    TabDragManager: Symbol('TabDragManager'),

    TreeFacade: Symbol('TreeFacade'),
    TreeRenderer: Symbol('TreeRenderer'),
    TreeStore: Symbol('TreeStore'),
    TreeDragManager: Symbol('TreeDragManager'),
    
    CommandDispatcher: Symbol('CommandDispatcher'),
}

export default DI_KEYS