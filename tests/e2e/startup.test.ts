import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CLIProcess, stripAnsi } from '#tests/helpers/cli-runner.js'

describe('startup', () => {
	let cli: CLIProcess

	beforeEach(() => {
		cli = new CLIProcess()
	})

	afterEach(() => {
		cli.kill()
	})

	it('renders without writing to stderr', async () => {
		const errors: string[] = []
		cli.onStderr((chunk) => errors.push(chunk))

		await cli.waitForRenderCount(1)

		expect(errors).toHaveLength(0)
	})

	it('renders the grid box-drawing frame', async () => {
		await cli.waitForRenderCount(1)

		const output = cli.getOutput()
		expect(output).toContain('╔')
		expect(output).toContain('╚')
		expect(output).toContain('║')
		expect(output).toContain('═')
	})

	it('renders exactly 6 data rows', async () => {
		await cli.waitForRenderCount(1)

		const clean = stripAnsi(cli.getOutput())
		const dataRows = clean.split('\n').filter((line) => line.includes('│'))

		expect(dataRows).toHaveLength(6)
	})

	it('highlights the cursor cell with ANSI on the initial render', async () => {
		await cli.waitForRenderCount(1)

		// With FORCE_COLOR=1, pc.inverse() wraps the cursor cell in ANSI escape codes
		const output = cli.getOutput()
		expect(output).toMatch(/\x1B\[/)
	})

	it('does not exit on its own after rendering', async () => {
		await cli.waitForRenderCount(1)

		// Give the process a moment to prove it stays alive
		await new Promise((r) => setTimeout(r, 300))

		expect(cli.getExitCode()).toBeNull()
	})
})
