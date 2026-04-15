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
				this.grid[rowIdx][colIdx] = 0
				const valid = isValid(this.grid, rowIdx, colIdx, value)
				this.grid[rowIdx][colIdx] = value

				return valid
			}),
		)
	}

	isValidMove(row: number, col: number, value: number): boolean {
		if (!this.isEditable(row, col)) return false
		return isValid(this.grid, row, col, value)
	}

	deleteValue(row: number, col: number): void {
		if (this.isEditable(row, col)) {
			this.grid[row][col] = 0
		}
	}

	setCell(row: number, col: number, value: CellValue): EditStatus {
		if (!this.isEditable(row, col)) {
			return {
				type: 'readonly_cell',
				message: 'Esta celda no es editable',
			}
		}

		// Temporarily set the cell to 0 to validate the move and then set it to the new value
		this.grid[row][col] = 0
		const isValidMove = this.isValidMove(row, col, value)
		this.grid[row][col] = value

		if (!isValidMove) {
			return {
				type: 'collision',
				message: `El valor ${value} ya existe en la fila, columna o bloque`,
			}
		}

		return null
	}
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

function findEmptyCell(grid: Grid): { row: number; col: number } | null {
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 6; col++) {
			if (grid[row][col] === 0) return { row, col }
		}
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

export function getGrid(): Grid {
	const grid = Array.from({ length: 6 }, () => Array(6).fill(0)) as Grid

	fillGrid(grid)

	return grid
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
