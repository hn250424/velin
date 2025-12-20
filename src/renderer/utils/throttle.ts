export function throttle<T extends (...args: any[]) => any>(fn: T, wait = 500) {
	let lastTime = 0;
	return function (...args: any[]) {
		const now = Date.now();
		if (now - lastTime >= wait) {
			lastTime = now;
			fn(...args);
		}
	};
}
