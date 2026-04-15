import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '#src/renderer.js'
import type { Cursor, EditStatus, Grid } from '#src/types.js'

// Mock picocolors before renderer is evaluated so STATUS_COLORS captures the mocks
vi.mock('picocolors', () => ({
	default: {
		inverse: (s: string) => `[inv]${s}[/inv]`,
		bgRed: (s: string) => `[bgRed]${s}[/bgRed]`,
		white: (s: string) => `[white]${s}[/white]`,
		red: (s: string) => `[red]${s}[/red]`,
		green: (s: string) => `[green]${s}[/green]`,
		yellow: (s: string) => `[yellow]${s}[/yellow]`,
	},
}))

// Fixed 6×6 grid with an empty cell at [2][1] (value 0)
const GRID: Grid = [
	[1, 2, 3, 4, 5, 6],
	[4, 5, 6, 1, 2, 3],
	[2, 0, 1, 5, 6, 4],
	[5, 6, 4, 2, 3, 1],
	[3, 1, 2, 6, 4, 5],
	[6, 4, 5, 3, 1, 2],
] as Grid

const CURSOR: Cursor = { x: 0, y: 0 }

describe('render', () => {
	let clearSpy: ReturnType<typeof vi.spyOn>
	let logSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		clearSpy = vi.spyOn(console, 'clear').mockImplementation(() => {})
		logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('calls console.clear once per render', () => {
		render(GRID, CURSOR)
		expect(clearSpy).toHaveBeenCalledOnce()
	})

	it('outputs the top border', () => {
		render(GRID, CURSOR)
		const board: string = logSpy.mock.calls[0][0]
		expect(board).toContain('┏')
	})

	it('outputs the bottom border', () => {
		render(GRID, CURSOR)
		const board: string = logSpy.mock.calls[0][0]
		expect(board).toContain('┗')
	})

	it('outputs the block separator', () => {
		render(GRID, CURSOR)
		const board: string = logSpy.mock.calls[0][0]
		expect(board).toContain('┣')
	})

	it('renders grid values in the board', () => {
		render(GRID, { x: 5, y: 5 }) // cursor away from cells with 2 and 6
		const board: string = logSpy.mock.calls[0][0]
		expect(board).toContain('2')
		expect(board).toContain('6')
	})

	it('renders an empty cell (value 0) as a space between delimiters', () => {
		render(GRID, { x: 5, y: 5 }) // cursor away from the empty cell at [2][1]
		const board: string = logSpy.mock.calls[0][0]
		// Empty cell produces 3 spaces between pipes: │<space><space><space>│
		// (separator part ' │ ' + space value + leading space of next part ' │')
		expect(board).toMatch(/│ {3}│/)
	})

	it('applies pc.inverse to the focused cell', () => {
		render(GRID, { x: 2, y: 0 }) // cell [0][2] = 3
		const board: string = logSpy.mock.calls[0][0]
		expect(board).toContain('[inv]3[/inv]')
	})

	it('applies pc.bgRed + pc.white to the focused cell when status is collision', () => {
		const status: EditStatus = { type: 'collision', message: 'collision' }
		render(GRID, { x: 2, y: 0 }, status) // cell [0][2] = 3
		const board: string = logSpy.mock.calls[0][0]
		expect(board).toContain('[bgRed][white]3[/white][/bgRed]')
	})

	it('does not apply focus styles to non-cursor cells', () => {
		render(GRID, { x: 0, y: 0 }) // cursor at [0][0]=1; cell [0][2]=3 is not focused
		const board: string = logSpy.mock.calls[0][0]
		expect(board).toContain('3')
		expect(board).not.toContain('[inv]3[/inv]')
	})

	it('prints the status message below the board', () => {
		const status: EditStatus = { type: 'completed', message: 'Puzzle done!' }
		render(GRID, CURSOR, status)
		// log calls: [0] board, [1] blank line, [2] status message
		expect(logSpy.mock.calls[2][0]).toBe('[green]Puzzle done![/green]')
	})

	it('prints the status message in yellow for readonly_cell', () => {
		const status: EditStatus = { type: 'readonly_cell', message: 'Read only' }
		render(GRID, CURSOR, status)
		expect(logSpy.mock.calls[2][0]).toBe('[yellow]Read only[/yellow]')
	})

	it('prints the status message in yellow for invalid_key', () => {
		const status: EditStatus = { type: 'invalid_key', message: 'Bad key' }
		render(GRID, CURSOR, status)
		expect(logSpy.mock.calls[2][0]).toBe('[yellow]Bad key[/yellow]')
	})

	it('prints the status message in red for collision', () => {
		const status: EditStatus = { type: 'collision', message: 'Already there' }
		render(GRID, CURSOR, status)
		expect(logSpy.mock.calls[2][0]).toBe('[red]Already there[/red]')
	})

	it('does not print a status message line when status is null', () => {
		render(GRID, CURSOR)
		// Only board + blank line = 2 calls
		expect(logSpy).toHaveBeenCalledTimes(2)
	})
})
