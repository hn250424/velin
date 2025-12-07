export function debounce<Func extends (...args: any[]) => void>(
	func: Func,
	wait: number
): Func {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	// return function (this: any, ...args: any[]) {
	//     if (timeout) clearTimeout(timeout)
	//     timeout = setTimeout(() => {
	//         func.apply(this, args)
	//     }, wait)
	// } as Func

	return function (this: any, ...args: any[]) {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			func(...args);
		}, wait);
	} as Func;
}
