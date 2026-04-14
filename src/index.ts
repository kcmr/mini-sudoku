#!/usr/bin/env nodeimport { getGrid } from './engine.js';
import { arrayRange, getGrid, removeCells } from './engine.js';
import { render } from './ui.js';
import readline from 'readline';

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const cursor = {x: 0, y: 0}
const grid = getGrid()
const incompleteGrid = removeCells(grid)

render(incompleteGrid, cursor);


process.stdin.on('keypress', (str, key) => {
  let errorMessage = ''
  
  if (key.ctrl && key.name === 'c') process.exit(0);

  if (key.name === 'up' && cursor.y > 0) cursor.y--;
  if (key.name === 'down' && cursor.y < 5) cursor.y++;
  if (key.name === 'left' && cursor.x > 0) cursor.x--;
  if (key.name === 'right' && cursor.x < 5) cursor.x++;

  const allowedNumbers = arrayRange(1, 6).map((n) => String(n))
  
  if (allowedNumbers.includes(key.name)) {
    incompleteGrid[cursor.y][cursor.x] = parseInt(key.name);
  } else if (key.name && key.name.match(/^[a-z0-9]$/i)) {
    // Si pulsa cualquier otra letra o número no válido (ej: 'e', '7', '9')
    errorMessage = `La tecla ${key.name} no es válida. Usa números del 1 al 6.`
  }

  render(incompleteGrid, cursor, errorMessage);
});
