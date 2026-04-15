import pc from 'picocolors'
import type { Formatter } from 'picocolors/types.js'
import type { Cursor, EditStatus, Grid, Status } from './types.js'

// biome-ignore format: keep spaces for legibility
const TEMPLATE = {
	top           : '┏━━━┯━━━┯━━━┳━━━┯━━━┯━━━┓',
	row           : '┃ n │ n │ n ┃ n │ n │ n ┃',
	rowSeparator  : '┠───┼───┼───╂───┼───┼───┨',
	blockSeparator: '┣━━━━━━━━━━━╋━━━━━━━━━━━┫',
	bottom        : '┗━━━┷━━━┷━━━┻━━━┷━━━┷━━━┛',
}

const STATUS_COLORS: Record<Status, Formatter> = {
	collision: pc.red,
	completed: pc.green,
	readonly_cell: pc.yellow,
	invalid_key: pc.yellow,
}

export function render(grid: Grid, cursor: Cursor, status: EditStatus = null) {
	console.clear()
	buildBoard(grid, cursor, status)
	console.log()

	if (status) {
		const color = STATUS_COLORS[status.type]
		console.log(color(status.message))
	}
}

function buildBoard(grid: Grid, cursor: Cursor, status: EditStatus) {
	const lines = [TEMPLATE.top]

	for (let row = 0; row < 6; row++) {
		const parts = TEMPLATE.row.split('n')
		const rowString = parts
			.map((part, colIndex) => {
				const value = grid[row][colIndex]
				if (value === undefined) return part // last fragment after the last 'n'
				const isFocusedCell = cursor.y === row && cursor.x === colIndex
				return part + formatCell(value, isFocusedCell, status)
			})
			.join('')

		lines.push(rowString)
		lines.push(getRowSeparator(row))
	}

	console.log(lines.join(`\n`))
}

function formatCell(
	value: number,
	isFocused: boolean,
	status: EditStatus,
): string {
	let displayValue = value === 0 ? ' ' : value.toString()

	if (isFocused) {
		displayValue =
			status?.type === 'collision'
				? pc.bgRed(pc.white(displayValue))
				: pc.inverse(displayValue)
	}

	return displayValue
}

function getRowSeparator(row: number): string {
	if (row === 5) return TEMPLATE.bottom
	if (row === 1 || row === 3) return TEMPLATE.blockSeparator
	return TEMPLATE.rowSeparator
}
