import { injectable } from "inversify"

@injectable()
export class SideDragManager {
	readonly minWidth = 100
	readonly maxWidth = 500

	private _isDragging = false
	private _animationFrameId: number | null = null

	//

	isDragging(): boolean {
		return this._isDragging
	}

	startDrag() {
		this._isDragging = true
	}

	endDrag() {
		this._isDragging = false
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId)
			this.animationFrameId = null
		}
	}

	//

	get animationFrameId() {
		return this._animationFrameId
	}

	set animationFrameId(id: number | null) {
		this._animationFrameId = id
	}
}
