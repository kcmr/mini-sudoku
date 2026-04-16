import { parseArgs } from 'node:util'
import { cancel, intro, isCancel, note, outro, select } from '@clack/prompts'
import type { Level } from './types.js'

const VALID_LEVELS: Level[] = ['easy', 'medium', 'hard']

export async function resolveLevel(): Promise<Level> {
	const { level, help } = parseCliArgs()
	if (help) {
		printHelp()
		process.exit(0)
	}
	if (level !== null) return level
	return runLevelPrompt()
}

function parseCliArgs() {
	const { values } = parseArgs({
		args: process.argv.slice(2),
		options: {
			level: { type: 'string', short: 'l' },
			help: { type: 'boolean', short: 'h' },
		},
		strict: false,
	})
	const level =
		typeof values.level === 'string' && isLevel(values.level)
			? values.level
			: null
	const help = values.help === true
	return { level, help }
}

function isLevel(value: string): value is Level {
	return (VALID_LEVELS as string[]).includes(value)
}

function printHelp() {
	console.log(
		[
			'Usage: mini-sudoku [options]',
			'',
			'Options:',
			'  -l, --level <easy|medium|hard>   Start the game at the given difficulty (skips the prompt)',
			'  -h, --help                       Show this help message',
		].join('\n'),
	)
}

async function runLevelPrompt(): Promise<Level> {
	intro('mini-sudoku')

	note(
		[
			'Arrow keys   Move the cursor',
			'1 – 6        Fill a cell',
			'x            Delete cell value',
			'Ctrl+R       Reset the board',
			'Ctrl+C       Quit',
		].join('\n'),
		'Controls',
	)

	const level = await select<Level>({
		message: 'Choose a difficulty',
		options: [
			{ value: 'easy', label: 'Easy', hint: '18 cells to fill' },
			{ value: 'medium', label: 'Medium', hint: '24 cells to fill' },
			{ value: 'hard', label: 'Hard', hint: '30 cells to fill' },
		],
	})

	if (isCancel(level)) {
		cancel('Bye!')
		process.exit(0)
	}

	outro("Good luck! Let's play.")

	return level
}
