import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CLIProcess } from '../helpers/cli-runner.js'

// Raw escape sequences for arrow keys
const RIGHT = '\x1B[C'
const LEFT = '\x1B[D'
const UP = '\x1B[A'
const DOWN = '\x1B[B'

describe('navigation', () => {
	let cli: CLIProcess

	beforeEach(async () => {
		cli = new CLIProcess()
		await cli.waitForRenderCount(1) // wait for initial render
	})

	afterEach(() => {
		cli.kill()
	})

	it('right arrow changes the render (cursor moves right)', async () => {
		const renderBefore = CLIProcess.extractLastRender(cli.getOutput())

		cli.send(RIGHT)
		await cli.waitForRenderCount(2)

		const renderAfter = CLIProcess.extractLastRender(cli.getOutput())
		expect(renderAfter).not.toBe(renderBefore)
	})

	it('down arrow changes the render (cursor moves down)', async () => {
		const renderBefore = CLIProcess.extractLastRender(cli.getOutput())

		cli.send(DOWN)
		await cli.waitForRenderCount(2)

		const renderAfter = CLIProcess.extractLastRender(cli.getOutput())
		expect(renderAfter).not.toBe(renderBefore)
	})

	it('right*5 then left*5 restores cursor to column 0', async () => {
		const renderInitial = CLIProcess.extractLastRender(cli.getOutput())

		// Move right to the last column, then back
		for (let i = 0; i < 5; i++) cli.send(RIGHT)
		for (let i = 0; i < 5; i++) cli.send(LEFT)
		await cli.waitForRenderCount(11) // 1 initial + 10 key presses

		const renderFinal = CLIProcess.extractLastRender(cli.getOutput())
		expect(renderFinal).toBe(renderInitial)
	})

	it('down*5 then up*5 restores cursor to row 0', async () => {
		const renderInitial = CLIProcess.extractLastRender(cli.getOutput())

		// Move down to the last row, then back
		for (let i = 0; i < 5; i++) cli.send(DOWN)
		for (let i = 0; i < 5; i++) cli.send(UP)
		await cli.waitForRenderCount(11) // 1 initial + 10 key presses

		const renderFinal = CLIProcess.extractLastRender(cli.getOutput())
		expect(renderFinal).toBe(renderInitial)
	})

	it('left arrow at left border does not move cursor', async () => {
		// Cursor starts at (0,0) — already at left border
		const renderAtBorder = CLIProcess.extractLastRender(cli.getOutput())

		cli.send(LEFT)
		await cli.waitForRenderCount(2)

		const renderAfter = CLIProcess.extractLastRender(cli.getOutput())
		expect(renderAfter).toBe(renderAtBorder)
	})

	it('up arrow at top border does not move cursor', async () => {
		// Cursor starts at (0,0) — already at top border
		const renderAtBorder = CLIProcess.extractLastRender(cli.getOutput())

		cli.send(UP)
		await cli.waitForRenderCount(2)

		const renderAfter = CLIProcess.extractLastRender(cli.getOutput())
		expect(renderAfter).toBe(renderAtBorder)
	})
})
