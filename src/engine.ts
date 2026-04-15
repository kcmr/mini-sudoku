import type { Grid, Level } from './types.js'

export function arrayRange(start: number, end: number): number[] {
	const length = end + 1 - start

	return Array.from({ length }).map((_, i) => start + i)
}

export function isValid(grid: Grid, row: number, col: number, num: number) {
	// check if value is already present in the column or row
	for (let i = 0; i < 6; i++) {
		if (grid[row][i] === num || grid[i][col] === num) return false
	}

	const startRow = Math.floor(row / 2) * 2
	const startCol = Math.floor(col / 3) * 3

	// check if the value is already present in the block
	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < 3; j++) {
			if (grid[startRow + i][startCol + j] === num) return false
		}
	}

	return true
}

function shuffle(array: number[]): number[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}

function fillGrid(grid: Grid): boolean {
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 6; col++) {
			if (grid[row][col] === 0) {
				const numbers = shuffle(arrayRange(1, 6))

				for (const num of numbers) {
					if (isValid(grid, row, col, num)) {
						grid[row][col] = num

						if (fillGrid(grid)) {
							return true
						}

						grid[row][col] = 0
					}
				}

				return false
			}
		}
	}

	return true
}

export function getGrid(): Grid {
	const grid = Array.from({ length: 6 }, () => Array(6).fill(0)) as Grid

	fillGrid(grid)

	return structuredClone(grid)
}

export function removeRandomCells(grid: Grid, level: Level = 'medium'): Grid {
	const gridCopy = structuredClone(grid)
	const cellsToRemove: number = (
		{
			easy: 3,
			medium: 4,
			hard: 5,
		} as Record<Level, number>
	)[level]

	for (let row = 0; row < 6; row++) {
		const randomIndexes = shuffle(arrayRange(0, 5))

		for (let i = 0; i < cellsToRemove; i++) {
			const col = randomIndexes.pop() ?? 0
			gridCopy[row][col] = 0
		}
	}

	return gridCopy
}

export function isGridComplete(grid: Grid): boolean {
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 6; col++) {
			const value = grid[row][col]

			if (value === 0) return false

			grid[row][col] = 0
			const valid = isValid(grid, row, col, value)
			grid[row][col] = value

			if (!valid) return false
		}
	}

	return true
}
