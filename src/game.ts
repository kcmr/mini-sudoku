import type { Key } from 'node:readline'
import { Puzzle } from './puzzle.js'
import { render } from './renderer.js'
import {
	type Cursor,
	type Direction,
	type EditStatus,
	isCellValue,
} from './types.js'

export function startGame() {
	const puzzle = new Puzzle()
	const cursor: Cursor = { x: 0, y: 0 }

	render(puzzle.grid, cursor)

	process.stdin.on('keypress', handleKeyPress(cursor, puzzle))
}

function handleKeyPress(
	cursor: Cursor,
	puzzle: Puzzle,
): (stream: unknown, key: Key) => void {
	return (_stream, key: Key) => {
		handleExit(key)
		moveCursor(cursor, key.name as Direction)
		updatePuzzle(puzzle, key, cursor)
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

function updatePuzzle(puzzle: Puzzle, key: Key, cursor: Cursor) {
	let editStatus: EditStatus = null
	const value = Number(key.name)
	const isDeleteKey = key.name === 'x'
	const { y: row, x: col } = cursor

	if (isCellValue(value)) {
		editStatus = puzzle.setCell(row, col, value)

		if (!editStatus && puzzle.isComplete()) {
			render(puzzle.grid, cursor, {
				type: 'completed',
				message: '¡Enhorabuena! Mini Sudoku completado',
			})

			process.exit(0)
		}
	} else if (isDeleteKey) {
		puzzle.deleteValue(row, col)
	} else if (key?.name?.match(/^[a-z0-9]$/i)) {
		editStatus = {
			type: 'invalid_key',
			message: `La tecla ${key.name} no es válida. Usa números del 1 al 6.`,
		}
	}

	render(puzzle.grid, cursor, editStatus)
}
