#!/usr/bin/env node

import readline from 'node:readline'
import { startGame } from './game.js'
import { resolveLevel } from './prompts.js'

const level = await resolveLevel()

readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) {
	process.stdin.setRawMode(true)
	process.stdin.resume()
}

startGame(level)
