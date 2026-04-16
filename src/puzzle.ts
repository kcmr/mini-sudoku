import type { CellValue, EditStatus, Grid, Level } from './types.js'
import { arrayRange, shuffle } from './utils.js'

export class Puzzle {
	/** Original grid with some cells removed (0 represents empty cells) */
	readonly initialGrid: Grid

	/** Current state of the grid, mutable by the player */
	grid: Grid

	constructor(level: Level = 'medium') {
		this.initialGrid = removeRandomCells(getGrid(), level)
		this.grid = structuredClone(this.initialGrid)
	}

	isEditable(row: number, col: number): boolean {
		return this.initialGrid[row][col] === 0
	}

	isComplete(): boolean {
		return this.grid.every((row, rowIdx) =>
			row.every((value, colIdx) => {
				if (value === 0) return false
				return isValid(this.grid, rowIdx, colIdx, value)
			}),
		)
	}

	isValid(row: number, col: number, value: number): boolean {
		return isValid(this.grid, row, col, value)
	}

	deleteValue(row: number, col: number): EditStatus {
		if (this.isEditable(row, col)) {
			this.grid[row][col] = 0
			return null
		}

		return {
			type: 'readonly_cell',
			message: 'This cell is not editable',
		}
	}

	setCell(row: number, col: number, value: CellValue): EditStatus {
		if (!this.isEditable(row, col)) {
			return {
				type: 'readonly_cell',
				message: 'This cell is not editable',
			}
		}

		this.grid[row][col] = value

		if (!this.isValid(row, col, value)) {
			return {
				type: 'collision',
				message: `The value ${value} already exists in the row, column, or block`,
			}
		}

		return null
	}

	reset(): Exclude<EditStatus, null> {
		this.grid = structuredClone(this.initialGrid)

		return {
			type: 'reset',
			message: 'Puzzle reset',
		}
	}
}

// --- Helper functions for grid generation and validation ---

function isValid(grid: Grid, row: number, col: number, num: number) {
	for (let i = 0; i < 6; i++) {
		if (i !== col && grid[row][i] === num) return false // ignore current cell in the row
		if (i !== row && grid[i][col] === num) return false // ignore current cell in the column
	}

	const startRow = Math.floor(row / 2) * 2
	const startCol = Math.floor(col / 3) * 3

	// check if the value is already present in the block
	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < 3; j++) {
			const isSelf = startRow + i === row && startCol + j === col
			if (!isSelf && grid[startRow + i][startCol + j] === num) return false
		}
	}

	return true
}

function findEmptyCell(grid: Grid): { row: number; col: number } | null {
	for (const [rowIndex, row] of grid.entries()) {
		const col = row.indexOf(0)
		if (col !== -1) return { row: rowIndex, col }
	}

	return null
}

function tryCandidates(grid: Grid, row: number, col: number): boolean {
	const candidates = shuffle(arrayRange(1, 6))

	for (const num of candidates) {
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

function fillGrid(grid: Grid): boolean {
	const cell = findEmptyCell(grid)
	if (!cell) return true
	return tryCandidates(grid, cell.row, cell.col)
}

function getGrid(): Grid {
	const grid = Array.from({ length: 6 }, () => Array(6).fill(0)) as Grid

	fillGrid(grid)

	return grid
}

function removeRandomCells(grid: Grid, level: Level = 'medium'): Grid {
	const gridCopy = structuredClone(grid)
	const cellsToRemove: number = {
		easy: 3,
		medium: 4,
		hard: 5,
	}[level]

	for (let row = 0; row < 6; row++) {
		const randomIndexes = shuffle(arrayRange(0, 5))

		for (let i = 0; i < cellsToRemove; i++) {
			const col = randomIndexes[i]
			gridCopy[row][col] = 0
		}
	}

	return gridCopy
}
