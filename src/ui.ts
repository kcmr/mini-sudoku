import dedent from 'dedent'
import pc from 'picocolors'
import type { Formatter } from 'picocolors/types.js'
import type { Cursor, EditStatus, Grid, Status } from './types.js'

export function render(grid: Grid, cursor: Cursor, status: EditStatus = null) {
	console.clear()

	// biome-ignore format: keep spaces for legibility
	const templateParts = {
		top           : '┏━━━┯━━━┯━━━┳━━━┯━━━┯━━━┓',
		row           : '┃ n │ n │ n ┃ n │ n │ n ┃',
		rowSeparator  : '┠───┼───┼───╂───┼───┼───┨',
		blockSeparator: '┣━━━━━━━━━━━╋━━━━━━━━━━━┫',
		bottom        : '┗━━━┷━━━┷━━━┻━━━┷━━━┷━━━┛',
	}

	const lines = [templateParts.top]

	for (let row = 0; row < 6; row++) {
		let colIndex = 0

		const rowString = templateParts.row.replace(/n/g, () => {
			const value = grid[row][colIndex]
			let displayValue = value === 0 ? ' ' : value.toString()

			const isFocusedCell = cursor && cursor.y === row && cursor.x === colIndex

			if (isFocusedCell) {
				displayValue =
					status?.type === 'collision'
						? pc.bgRed(pc.white(displayValue))
						: pc.inverse(displayValue)
			}

			colIndex++
			return displayValue
		})

		lines.push(rowString)

		if (row === 5) {
			lines.push(templateParts.bottom)
		} else if (row === 1 || row === 3) {
			lines.push(templateParts.blockSeparator)
		} else {
			lines.push(templateParts.rowSeparator)
		}
	}

	console.log(dedent`${lines.join(`\n`)}`)
	console.log(`\n`)

	if (status) {
		const color = (
			{
				collision: pc.red,
				completed: pc.green,
				readonly_cell: pc.yellow,
				invalid_key: pc.yellow,
			} as Record<Status, Formatter>
		)[status.type]

		console.log(color(status.message))
	}
}
