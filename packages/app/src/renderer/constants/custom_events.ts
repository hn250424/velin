export const CUSTOM_EVENTS = {
	CLICK: {
		DEFAULT: Symbol("click-default"),

		IN: {
			TAB_CONTAINER: Symbol("click-in-tabContainer"),
			TREE_NODE_CONTAINER: Symbol("click-in-treeNodeContainer")
		}
	},

	MOUSE_DOWN: {
		DEFAULT: Symbol("mousedown-default"),
	},

	MOUSE_MOVE: {
		DEFAULT: Symbol("mousemove-default"),
	},

	MOUSE_UP: {
		DEFAULT: Symbol("mouseup-default"),
	},

	MOUSE_LEAVE: {
		DEFAULT: Symbol("mouseleave-default"),
	},
}
