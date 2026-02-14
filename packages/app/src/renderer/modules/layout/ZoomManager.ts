export default class ZoomManager {
	private zoomLevel = 1

	zoomIn() {
		this.setZoom(this.zoomLevel + 0.1)
	}

	zoomOut() {
		this.setZoom(this.zoomLevel - 0.1)
	}

	resetZoom() {
		this.setZoom(1)
	}

	private setZoom(level: number) {
		this.zoomLevel = Math.max(0.1, Math.min(level, 3))
		window.utils.setZoomFactor(this.zoomLevel)
	}
}
