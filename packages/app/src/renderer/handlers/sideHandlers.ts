import type { SideDto } from "@shared/dto/SideDto";
import SideState from "../modules/state/SideState";
import { CLASS_SELECTED } from "../constants/dom";

export default function registerSideHandlers(sideState: SideState) {
	let isDragging = false;
	let animationFrameId: number | null = null;
	let dragStartX: number;
	let initialTreeWidth: number;

	const minWidth = 100;
	const maxWidth = 500;

	const side = document.getElementById("side") as HTMLElement;

	const treeToggle = document.getElementById("treeToggle") as HTMLElement;
	const tree = document.getElementById("tree") as HTMLElement;
	const resizer = document.getElementById("side_resizer") as HTMLElement;

	const settingsBtn = document.getElementById("settingsBtn") as HTMLElement;

	processTreeOpenState();

	// open & close file tree.
	treeToggle.addEventListener("click", async () => {
		const isOpen = sideState.isTreeOpen();
		sideState.setTreeOpenState(!isOpen);
		syncSession();
		processTreeOpenState();
	});

	function processTreeOpenState() {
		const isOpen = sideState.isTreeOpen();
		if (isOpen) {
			tree.style.width = `${sideState.getTreeWidth()}px`;
			treeToggle.classList.add(CLASS_SELECTED);
		} else {
			tree.style.width = "0px";
			treeToggle.classList.remove(CLASS_SELECTED);
		}
	}

	async function syncSession() {
		const sideDto: SideDto = {
			open: sideState.isTreeOpen(),
			width: sideState.getTreeWidth(),
		};
		const result = await window.rendererToMain.syncSideSessionFromRenderer(sideDto);
	}

	// resize.
	resizer.addEventListener("mousedown", (e) => {
		if (!sideState.isTreeOpen()) {
			sideState.setTreeOpenState(true);
		}

		isDragging = true;
		dragStartX = e.clientX;
		initialTreeWidth = tree.offsetWidth;
		document.body.style.cursor = "ew-resize";
		document.body.style.userSelect = "none";
	});

	document.addEventListener("mousemove", (e) => {
		if (!isDragging) return;

		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}

		animationFrameId = requestAnimationFrame(() => {
			const deltaX = e.clientX - dragStartX;
			const newWidth = initialTreeWidth + deltaX;
			const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

			tree.style.width = `${clampedWidth}px`;
		});
	});

	document.addEventListener("mouseup", async (e) => {
		if (!isDragging) return;

		isDragging = false;
		document.body.style.cursor = "";
		document.body.style.userSelect = "";

		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}

		const deltaX = e.clientX - dragStartX;
		const newWidth = initialTreeWidth + deltaX;
		const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

		sideState.setTreeWidth(clampedWidth);
		syncSession();
	});
}
