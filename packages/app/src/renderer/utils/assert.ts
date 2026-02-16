const __DEV__ = process.env.NODE_ENV !== 'production';

export function assert(condition: any, message: string): asserts condition {
	if (__DEV__ && !condition) throw new Error(message)
}
