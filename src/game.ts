import type { Key } from 'node:readline'
import { Puzzle } from './puzzle.js'
import { render } from './renderer.js'
import {
	type Cursor,
	type Direction,
	type EditStatus,
	isCellValue,
	type Level,
} from './types.js'

export function startGame(level: Level = 'medium') {
	const puzzle = new Puzzle(level)
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

function resetCursor(cursor: Cursor) {
	cursor.x = 0
	cursor.y = 0
}

function updatePuzzle(puzzle: Puzzle, key: Key, cursor: Cursor) {
	let editStatus: EditStatus = null
	const { y: row, x: col } = cursor

	const value = Number(key.name)
	const isAllowedCellValue = isCellValue(value)
	const isDeleteKey = key.name === 'x'
	const isResetCommand = key.ctrl && key.name === 'r'
	const isAnyDigitOrNumber = key?.name?.match(/^[a-z0-9]$/i)

	if (isAllowedCellValue) {
		editStatus = puzzle.setCell(row, col, value)

		if (!editStatus && puzzle.isComplete()) {
			render(puzzle.grid, cursor, {
				type: 'completed',
				message: 'Congrats! Mini Sudoku completed!',
			})

			process.exit(0)
		}
	} else if (isDeleteKey) {
		editStatus = puzzle.deleteValue(row, col)
	} else if (isResetCommand) {
		editStatus = puzzle.reset()
		resetCursor(cursor)
	} else if (isAnyDigitOrNumber) {
		editStatus = {
			type: 'invalid_key',
			message: `Key ${key.name} is not valid. Use numbers from 1 to 6.`,
		}
	}

	render(puzzle.grid, cursor, editStatus)
}
