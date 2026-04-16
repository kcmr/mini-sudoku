import type { EditStatus, Status } from './types.js'

export function getEditStatus(
	status: Status,
	value?: string,
): Exclude<EditStatus, null> {
	const messages: Record<Status, string> = {
		completed: 'Congrats! Mini Sudoku completed!',
		reset: 'Puzzle reset',
		readonly_cell: 'This cell is not editable',
		collision: `The value ${value} already exists in the row, column, or block`,
		invalid_key: `Key ${value} is not valid. Use numbers from 1 to 6.`,
	}

	return { type: status, message: messages[status] }
}
