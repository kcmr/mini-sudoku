export type Cursor = {
	x: number
	y: number
}

export type Grid = [number, number, number, number, number, number][]

export type Level = 'easy' | 'medium' | 'hard'

const status = [
	'completed', // game-level: the puzzle is completed
	'invalid_key', // game-level: input not allowed
	'readonly_cell', // puzzle-level: edition rule
	'collision', // puzzle-level: validation rule
] as const

export type Status = (typeof status)[number]

export type EditStatus = {
	type: Status
	message: string
} | null

export type Direction = 'up' | 'down' | 'left' | 'right'

export type CellValue = 1 | 2 | 3 | 4 | 5 | 6

export function isCellValue(value: number): value is CellValue {
	return value >= 1 && value <= 6
}
