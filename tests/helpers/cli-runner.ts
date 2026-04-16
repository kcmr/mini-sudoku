import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { resolve } from 'node:path'

const DIST_PATH = resolve(process.cwd(), 'dist/cli.js')

const ANSI_REGEX =
	/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><~]/g

export function stripAnsi(str: string): string {
	return str.replace(ANSI_REGEX, '')
}

export class CLIProcess {
	private proc: ChildProcessWithoutNullStreams
	private output = ''

	constructor(args: string[] = ['--level=medium']) {
		this.proc = spawn('node', [DIST_PATH, ...args], {
			// Force colors so ANSI cursor codes are always present, even on non-TTY pipes
			env: { ...process.env, FORCE_COLOR: '1' },
		})
		this.proc.stdout.on('data', (chunk: Buffer) => {
			this.output += chunk.toString()
		})
	}

	/** Returns the number of complete renders received so far (one per keypress + 1 for startup). */
	getRenderCount(): number {
		return (this.output.match(/┗/g) ?? []).length
	}

	/**
	 * Resolves when the accumulated stdout contains `n` complete renders.
	 * Each render emits exactly one bottom-border `┗` character.
	 */
	waitForRenderCount(n: number, timeout = 5000): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.getRenderCount() >= n) {
				resolve()
				return
			}
			const timer = setTimeout(
				() =>
					reject(
						new Error(
							`Timeout waiting for ${n} renders (got ${this.getRenderCount()})`,
						),
					),
				timeout,
			)
			const check = () => {
				if (this.getRenderCount() >= n) {
					clearTimeout(timer)
					this.proc.stdout.off('data', check)
					resolve()
				}
			}
			this.proc.stdout.on('data', check)
		})
	}

	/**
	 * Resolves when the accumulated stdout contains `substring`.
	 * Rejects if `timeout` ms pass without a match.
	 */
	waitForOutput(substring: string, timeout = 5000): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.output.includes(substring)) {
				resolve()
				return
			}
			const timer = setTimeout(
				() => reject(new Error(`Timeout waiting for: ${substring}`)),
				timeout,
			)
			const check = () => {
				if (this.output.includes(substring)) {
					clearTimeout(timer)
					this.proc.stdout.off('data', check)
					resolve()
				}
			}
			this.proc.stdout.on('data', check)
		})
	}

	/** Register a listener for stderr data. */
	onStderr(listener: (chunk: string) => void): void {
		this.proc.stderr.on('data', (chunk: Buffer) => listener(chunk.toString()))
	}

	/** Returns the process exit code, or null if still running. */
	getExitCode(): number | null {
		return this.proc.exitCode
	}

	/** Write raw bytes to the process stdin. */
	send(data: string): void {
		this.proc.stdin.write(data)
	}

	getOutput(): string {
		return this.output
	}

	kill(): void {
		if (!this.proc.killed) {
			this.proc.kill()
		}
	}

	waitForExit(timeout = 3000): Promise<number | null> {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(
				() => reject(new Error('Timeout waiting for process exit')),
				timeout,
			)
			this.proc.on('close', (code) => {
				clearTimeout(timer)
				resolve(code)
			})
		})
	}

	/**
	 * Extracts the last complete render from the accumulated output.
	 * Slices from the last `┏` (top-left corner) to the end and trims whitespace.
	 * This avoids stale prefix bytes from a previous render leaking between assertions.
	 */
	static extractLastRender(output: string): string {
		const idx = output.lastIndexOf('┏')
		return (idx >= 0 ? output.slice(idx) : output).trim()
	}

	/**
	 * Parses the 6×6 grid from a raw stdout snapshot.
	 * Returns a 6×6 array of numbers (0 = empty cell).
	 *
	 * Data row format after stripping ANSI:
	 *   ┃ 5 │ 1 │ 2 ┃   │ 3 │ 4 ┃
	 * Cell value positions: 2, 6, 10, 14, 18, 22 (col * 4 + 2)
	 */
	static parseGridFromOutput(output: string): number[][] {
		const clean = stripAnsi(output)
		const grid: number[][] = []

		for (const line of clean.split('\n')) {
			// Data rows contain both ┃ and │; skip borders and separators
			if (!line.includes('│')) continue

			const cells: number[] = []
			for (let col = 0; col < 6; col++) {
				const char = line[2 + col * 4]
				cells.push(char && char.trim() !== '' ? Number(char) : 0)
			}

			if (cells.length === 6) {
				grid.push(cells)
			}
		}

		return grid
	}
}
