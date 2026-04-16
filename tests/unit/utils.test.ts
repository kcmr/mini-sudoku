import { describe, expect, it } from 'vitest'
import { arrayRange, shuffle } from '#src/utils.js'

describe('arrayRange', () => {
	it('returns an inclusive range from start to end', () => {
		expect(arrayRange(1, 6)).toEqual([1, 2, 3, 4, 5, 6])
	})

	it('returns a single-element array when start equals end', () => {
		expect(arrayRange(3, 3)).toEqual([3])
	})
})

describe('shuffle', () => {
	it('mutates and returns the same array reference', () => {
		const arr = [1, 2, 3, 4, 5, 6]
		const result = shuffle(arr)
		expect(result).toBe(arr)
	})

	it('preserves all original elements', () => {
		const arr = [1, 2, 3, 4, 5, 6]
		expect(shuffle([...arr]).sort()).toEqual(arr.sort())
	})
})
