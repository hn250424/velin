import { injectable } from "inversify"
import type { Zone, Task } from "./types"

@injectable()
export class FocusManager {
	private focusedZone: Zone = "none"
	private focusedTask: Task = "none"

	setFocusedZone(zone: Zone) {
		this.focusedZone = zone
	}

	getFocusedZone() {
		return this.focusedZone
	}

	setFocusedTask(task: Task) {
		this.focusedTask = task
	}

	getFocusedTask() {
		return this.focusedTask
	}
}
