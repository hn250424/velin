import { DOM, CUSTOM_EVENTS } from "@renderer/constants"
import { FocusManager, ShortcutRegistry } from "@renderer/core"
import type { Dispatcher } from "@renderer/dispatch"
import { EventEmitter } from "events"

const state = {
	down: false,
	ticking: false,
}

export function handleGlobalInput(
	dispatcher: Dispatcher,
	emitter: EventEmitter,
	focusManager: FocusManager,
	shortcutRegistry: ShortcutRegistry
) {
	bindDocumentMousedownEvnet(focusManager, emitter)

	bindDocumentMousedownEvnetForDrag(emitter)
	bindDocumentMousemoveEvnetForDrag(emitter)
	bindDocumentMouseupEvnetForDrag(emitter)
	bindDocumentMouseleaveEvnetForDrag(emitter)

	bindDocumentKeydownEvent(shortcutRegistry)
	bindShortcutEvent(dispatcher, shortcutRegistry)
}

//

const OUT_EVENT_RULES = [
	{ inZone: DOM.SELECTOR_EDITOR_CONTAINER, outEvent: CUSTOM_EVENTS.MOUSE_DOWN.OUT.EDITOR_CONTAINER },
	{ inZone: DOM.SELECTOR_SIDE, outEvent: CUSTOM_EVENTS.MOUSE_DOWN.OUT.SIDE },
	{ inZone: DOM.SELECTOR_TAB_CONTAINER, outEvent: CUSTOM_EVENTS.MOUSE_DOWN.OUT.TAB_CONTAINER },
	{ inZone: DOM.SELECTOR_TREE_CONTEXT_MENU, outEvent: CUSTOM_EVENTS.MOUSE_DOWN.OUT.TREE_CONTEXTMENU },
	{ inZone: DOM.SELECTOR_TAB_CONTEXT_MENU, outEvent: CUSTOM_EVENTS.MOUSE_DOWN.OUT.TAB_CONTEXTMENU },
	{ inZone: DOM.SELECTOR_FIND_REPLACE_CONTAINER, outEvent: CUSTOM_EVENTS.MOUSE_DOWN.OUT.FIND_REPLACE_CONTAINER },
	{ inZone: DOM.SELECTOR_MENU_ITEM, outEvent: CUSTOM_EVENTS.MOUSE_DOWN.OUT.MENU_ITEM },
	{ inZone: DOM.SELECTOR_WINDOW, outEvent: CUSTOM_EVENTS.MOUSE_DOWN.OUT.WINDOW },
]

function bindDocumentMousedownEvnet(focusManager: FocusManager, emitter: EventEmitter) {
	document.addEventListener("mousedown", (e) => {
		const target = e.target as HTMLElement
		focusManager.trackRelevantFocus(target)

		let activeItem = null
		for (const item of OUT_EVENT_RULES) {
			if (target.closest(item.inZone)) {
				activeItem = item
				break
			}
		}

		OUT_EVENT_RULES.forEach((item) => {
			if (item !== activeItem) {
				emitter.emit(item.outEvent, e)
			}
		})
	})
}

//

function bindDocumentMousedownEvnetForDrag(emitter: EventEmitter) {
	document.addEventListener("mousedown", (e) => {
		if (e.button !== 0) return
		state.down = true
		emitter.emit(CUSTOM_EVENTS.MOUSE_DOWN.DEFAULT, e)
	})
}

function bindDocumentMousemoveEvnetForDrag(emitter: EventEmitter) {
	document.addEventListener("mousemove", (e) => {
		if (!state.ticking) {
			state.ticking = true
			window.requestAnimationFrame(() => {
				emitter.emit(CUSTOM_EVENTS.MOUSE_MOVE.DEFAULT, e)
				state.ticking = false
			})
		}
	})
}

function bindDocumentMouseupEvnetForDrag(emitter: EventEmitter) {
	document.addEventListener("mouseup", (e) => {
		if (state.down) {
			emitter.emit(CUSTOM_EVENTS.MOUSE_UP.DEFAULT, e)
			state.down = false
		}
	})
}

function bindDocumentMouseleaveEvnetForDrag(emitter: EventEmitter) {
	document.addEventListener("mouseleave", (e) => {
		if (state.down) state.down = false
		emitter.emit(CUSTOM_EVENTS.MOUSE_LEAVE.DEFAULT, e)
	})
}

//

function bindDocumentKeydownEvent(shortcutRegistry: ShortcutRegistry) {
	document.addEventListener("keydown", (e) => {
		shortcutRegistry.handleKeyEvent(e)
	})
}

function bindShortcutEvent(dispatcher: Dispatcher, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("ESC", async () => await dispatcher.dispatch("esc", "shortcut"))
	shortcutRegistry.register("ENTER", async () => await dispatcher.dispatch("enter", "shortcut"))
}
