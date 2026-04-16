/**
 * Returns an array of numbers from start to end (inclusive)
 */
export function arrayRange(start: number, end: number): number[] {
	const length = end + 1 - start

	return Array.from({ length }).map((_, i) => start + i)
}

/**
 * Shuffles an array in place (mutates the original array)
 */
export function shuffle(array: number[]): number[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}
