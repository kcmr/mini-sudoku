#!/usr/bin/env node

import readline from 'node:readline'
import { startGame } from './game.js'

readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) process.stdin.setRawMode(true)

startGame()
