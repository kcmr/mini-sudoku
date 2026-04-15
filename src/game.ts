import type { Key } from 'node:readline'
import {
	getGrid,
	isGridComplete,
	isValid,
	removeRandomCells,
} from './engine.js'
import { render } from './renderer.js'
import type { Cursor, Direction, EditStatus, Grid } from './types.js'
import { arrayRange } from './utils.js'

export function startGame() {
	const initialGrid = removeRandomCells(getGrid())
	const grid = structuredClone(initialGrid)
	const cursor: Cursor = { x: 0, y: 0 }

	render(grid, cursor)

	process.stdin.on('keypress', handleKeyPress(cursor, grid, initialGrid))
}

function handleKeyPress(
	cursor: Cursor,
	grid: Grid,
	initialGrid: Grid,
): (stream: unknown, key: Key) => void {
	return (_stream, key: Key) => {
		handleExit(key)
		moveCursor(cursor, key.name as Direction)
		updatePuzzle(grid, initialGrid, key, cursor)
	}
}

function handleExit(key: Key) {
	if (key.ctrl && key.name === 'c') process.exit(0)
}

function moveCursor(cursor: Cursor, direction: Direction) {
	if (direction === 'up' && cursor.y > 0) cursor.y--
	if (direction === 'down' && cursor.y < 5) cursor.y++
	if (direction === 'left' && cursor.x > 0) cursor.x--
	if (direction === 'right' && cursor.x < 5) cursor.x++
}

function updatePuzzle(grid: Grid, initialGrid: Grid, key: Key, cursor: Cursor) {
	const allowedNumbers = arrayRange(1, 6).map(String)
	const isDeleteKey = key.name === 'x'
	const value = Number(key.name)
	const editValue = isDeleteKey ? 0 : value

	let editStatus: EditStatus = null

	if (isDeleteKey || allowedNumbers.includes(key.name as string)) {
		editStatus = updateCell(grid, initialGrid, cursor, editValue)

		if (!editStatus && isGridComplete(grid)) {
			render(grid, cursor, {
				type: 'completed',
				message: '¡Enhorabuena! Mini Sudoku completado',
			})

			process.exit(0)
		}
	} else if (key?.name?.match(/^[a-z0-9]$/i)) {
		editStatus = {
			type: 'invalid_key',
			message: `La tecla ${key.name} no es válida. Usa números del 1 al 6.`,
		}
	}

	render(grid, cursor, editStatus)
}

function updateCell(
	grid: Grid,
	initialGrid: Grid,
	cursor: Cursor,
	value: number,
): EditStatus {
	const { y: row, x: col } = cursor
	const isEditableCell = initialGrid[row][col] === 0

	if (!isEditableCell) {
		return {
			type: 'readonly_cell',
			message: 'Esta celda no es editable',
		}
	}

	if (value === 0) {
		grid[row][col] = 0
		return null
	}

	grid[row][col] = 0

	const isValidMove = isValid(grid, row, col, value)
	grid[row][col] = value

	if (!isValidMove) {
		return {
			type: 'collision',
			message: `El valor ${value} ya existe en la fila, columna o bloque`,
		}
	}

	return null
}
