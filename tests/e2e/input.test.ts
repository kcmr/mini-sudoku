import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CLIProcess, stripAnsi } from '../helpers/cli-runner.js'

const RIGHT = '\x1B[C'
const DOWN = '\x1B[B'
const CTRL_C = '\x03'

describe('input handling', () => {
	let cli: CLIProcess

	beforeEach(async () => {
		cli = new CLIProcess()
		await cli.waitForRenderCount(1) // wait for initial render
	})

	afterEach(() => {
		cli.kill()
	})

	it('shows invalid_key message for unsupported keys', async () => {
		cli.send('a')
		// Wait for the message that appears after the grid in the render
		await cli.waitForOutput('La tecla a no es válida')

		const clean = stripAnsi(cli.getOutput())
		expect(clean).toContain('La tecla a no es válida')
	})

	it('shows readonly_cell message when typing on a pre-filled cell', async () => {
		// Parse the initial grid to locate the first pre-filled cell
		const grid = CLIProcess.parseGridFromOutput(cli.getOutput())
		const target = findPrefilledCell(grid)

		if (!target) {
			throw new Error(
				'No pre-filled cell found in initial grid — puzzle generation issue',
			)
		}

		// Navigate from (0,0) to the target cell (batch all keys, then wait for renders)
		const moves = target.col + target.row
		for (let i = 0; i < target.col; i++) cli.send(RIGHT)
		for (let i = 0; i < target.row; i++) cli.send(DOWN)
		if (moves > 0) await cli.waitForRenderCount(1 + moves)

		// Attempt to overwrite a pre-filled cell and wait for the error message
		cli.send('1')
		await cli.waitForOutput('Esta celda no es editable')

		const clean = stripAnsi(cli.getOutput())
		expect(clean).toContain('Esta celda no es editable')
	})

	it('shows no error message when deleting on an editable cell', async () => {
		// Navigate to the first empty cell (editable)
		const grid = CLIProcess.parseGridFromOutput(cli.getOutput())
		const target = findEmptyCell(grid)

		if (!target) {
			throw new Error('No empty cell found in initial grid')
		}

		const moves = target.col + target.row
		for (let i = 0; i < target.col; i++) cli.send(RIGHT)
		for (let i = 0; i < target.row; i++) cli.send(DOWN)
		if (moves > 0) await cli.waitForRenderCount(1 + moves)

		cli.send('x')
		await cli.waitForRenderCount(1 + moves + 1)

		const clean = stripAnsi(CLIProcess.extractLastRender(cli.getOutput()))
		expect(clean).not.toContain('Esta celda no es editable')
		expect(clean).not.toContain('ya existe')
		expect(clean).not.toContain('no es válida')
	})

	it('exits cleanly on Ctrl+C', async () => {
		cli.send(CTRL_C)
		const code = await cli.waitForExit()

		expect(code).toBe(0)
	})
})

// ─── helpers ────────────────────────────────────────────────────────────────

function findPrefilledCell(
	grid: number[][],
): { row: number; col: number } | null {
	for (let row = 0; row < grid.length; row++) {
		for (let col = 0; col < (grid[row]?.length ?? 0); col++) {
			if ((grid[row]?.[col] ?? 0) !== 0) return { row, col }
		}
	}
	return null
}

function findEmptyCell(grid: number[][]): { row: number; col: number } | null {
	for (let row = 0; row < grid.length; row++) {
		for (let col = 0; col < (grid[row]?.length ?? 0); col++) {
			if ((grid[row]?.[col] ?? 1) === 0) return { row, col }
		}
	}
	return null
}
