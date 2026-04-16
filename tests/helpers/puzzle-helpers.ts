import type { Puzzle } from '#src/puzzle.js'
import type { CellValue, Grid } from '#src/types.js'

/** A valid, complete 6×6 Sudoku grid (no zeros). Useful for isComplete / isValid tests. */
export const COMPLETE_GRID: Grid = [
	[1, 2, 3, 4, 5, 6],
	[4, 5, 6, 1, 2, 3],
	[2, 3, 1, 5, 6, 4],
	[5, 6, 4, 2, 3, 1],
	[3, 1, 2, 6, 4, 5],
	[6, 4, 5, 3, 1, 2],
] as Grid

/** Returns the first cell whose value is 0 in `grid`, or null if none. */
export function findEmptyCell(
	grid: number[][],
): { row: number; col: number } | null {
	for (let row = 0; row < grid.length; row++) {
		for (let col = 0; col < (grid[row]?.length ?? 0); col++) {
			if ((grid[row]?.[col] ?? 1) === 0) return { row, col }
		}
	}
	return null
}

/** Returns the first cell whose value is non-zero in `grid`, or null if none. */
export function findPrefilledCell(
	grid: number[][],
): { row: number; col: number } | null {
	for (let row = 0; row < grid.length; row++) {
		for (let col = 0; col < (grid[row]?.length ?? 0); col++) {
			if ((grid[row]?.[col] ?? 0) !== 0) return { row, col }
		}
	}
	return null
}

/** Returns the first editable cell in the puzzle (throws if none). */
export function firstEditable(puzzle: Puzzle): { row: number; col: number } {
	const cell = findEmptyCell(puzzle.initialGrid)
	if (!cell) throw new Error('No editable cell found')
	return cell
}

/** Returns the first non-editable cell in the puzzle (throws if none). */
export function firstNonEditable(puzzle: Puzzle): { row: number; col: number } {
	const cell = findPrefilledCell(puzzle.initialGrid)
	if (!cell) throw new Error('No non-editable cell found')
	return cell
}

/** Finds an editable cell and a value already present in its row (guaranteed collision). */
export function collisionCase(puzzle: Puzzle): {
	row: number
	col: number
	value: CellValue
} {
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 6; col++) {
			if (!puzzle.isEditable(row, col)) continue
			for (let c = 0; c < 6; c++) {
				const v = puzzle.grid[row][c]
				if (c !== col && v !== 0) return { row, col, value: v as CellValue }
			}
		}
	}
	throw new Error('No collision scenario found')
}

/** Finds an editable cell and a value that passes all constraints. */
export function validCase(puzzle: Puzzle): {
	row: number
	col: number
	value: CellValue
} {
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 6; col++) {
			if (!puzzle.isEditable(row, col)) continue
			for (let v = 1; v <= 6; v++) {
				if (puzzle.isValid(row, col, v))
					return { row, col, value: v as CellValue }
			}
		}
	}
	throw new Error('No valid placement found')
}
