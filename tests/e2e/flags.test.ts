import { afterEach, describe, expect, it } from 'vitest'
import { CLIProcess, stripAnsi } from '#tests/helpers/cli-runner.js'

describe('--help / -h', () => {
	let cli: CLIProcess

	afterEach(() => {
		cli.kill()
	})

	it('prints usage and available options', async () => {
		cli = new CLIProcess(['--help'])
		await cli.waitForExit()

		const output = stripAnsi(cli.getOutput())
		expect(output).toContain('Usage: mini-sudoku [options]')
		expect(output).toContain('--level')
		expect(output).toContain('--help')
	})

	it('exits with code 0', async () => {
		cli = new CLIProcess(['--help'])
		const code = await cli.waitForExit()
		expect(code).toBe(0)
	})

	it('-h is equivalent to --help', async () => {
		const full = new CLIProcess(['--help'])
		const short = new CLIProcess(['-h'])

		const [fullCode, shortCode] = await Promise.all([
			full.waitForExit(),
			short.waitForExit(),
		])

		expect(stripAnsi(full.getOutput())).toBe(stripAnsi(short.getOutput()))
		expect(fullCode).toBe(0)
		expect(shortCode).toBe(0)

		full.kill()
		short.kill()
	})
})

describe('--level / -l', () => {
	let cli: CLIProcess

	afterEach(() => {
		cli.kill()
	})

	it.each([
		['--level=easy', 'easy'],
		['--level=medium', 'medium'],
		['--level=hard', 'hard'],
		['-l', 'medium', 'medium'],
	] as [
		string,
		string,
		string?,
	][])('%s starts the game without a prompt', async (flag, value, _label) => {
		const args = flag === '-l' ? ['-l', value] : [flag]
		cli = new CLIProcess(args)
		await cli.waitForRenderCount(1)

		const output = stripAnsi(cli.getOutput())
		expect(output).toContain('┏')
		expect(cli.getExitCode()).toBeNull()
	})
})
