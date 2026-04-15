export type Cursor = {
	x: number
	y: number
}

export type Grid = [number, number, number, number, number, number][]

export type Level = 'easy' | 'medium' | 'hard'

const status = [
	'completed',
	'readonly_cell',
	'invalid_key',
	'collision',
] as const

export type Status = (typeof status)[number]

export type EditStatus = {
	type: Status
	message: string
} | null
