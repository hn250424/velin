const DI_KEYS = {
	FocusManager: Symbol("FocusManager"),
	SideState: Symbol("SideState"),
	WindowState: Symbol("WindowState"),

	ZoomManager: Symbol("ZoomManager"),

	ShortcutRegistry: Symbol("ShortcutRegistry"),

	TabEditorFacade: Symbol("TabEditorFacade"),
	TabEditorRenderer: Symbol("TabEditorRenderer"),
	TabEditorStore: Symbol("TabEditorStore"),
	TabDragManager: Symbol("TabDragManager"),

	TreeFacade: Symbol("TreeFacade"),
	TreeRenderer: Symbol("TreeRenderer"),
	TreeStore: Symbol("TreeStore"),
	TreeDragManager: Symbol("TreeDragManager"),

	SettingsFacade: Symbol("SettingsFacade"),
	SettingsRenderer: Symbol("SettingsRenderer"),
	SettingsStore: Symbol("SettingsStore"),

	CommandDispatcher: Symbol("CommandDispatcher"),
};

export default DI_KEYS;
