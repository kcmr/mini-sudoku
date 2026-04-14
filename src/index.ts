#!/usr/bin/env node

import { arrayRange, getGrid, isGridComplete, isValid, removeRandomCells } from './engine.js';
import { Grid, EditStatus } from './types.js';
import { render } from './ui.js';
import readline from 'readline';

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const cursor = {x: 0, y: 0}
const initialGrid = removeRandomCells(getGrid())
const grid = structuredClone(initialGrid)
const allowedNumbers = arrayRange(1, 6).map((n) => String(n))

render(grid, cursor);

function updateCell(grid: Grid, row: number, col: number, value: number): EditStatus {
  const isEditableCell = initialGrid[row][col] === 0

  if (!isEditableCell) {
    return {
      type: 'readonly_cell',
      message: 'Esta celda no es editable'
    }
  }

  if (value === 0) {
    grid[row][col] = 0
    return null
  }

  grid[row][col] = 0

  const isValidMove = isValid(grid, row, col, value)
  grid[row][col] = value

  if (!isValidMove) {
    return {
      type: 'collision',
      message: `El valor ${value} ya existe en la fila, columna o bloque`
    }
  }

  return null
}

process.stdin.on('keypress', (str, key) => {
  let editStatus: EditStatus = null
  
  if (key.ctrl && key.name === 'c') process.exit(0);

  if (key.name === 'up' && cursor.y > 0) cursor.y--;
  if (key.name === 'down' && cursor.y < 5) cursor.y++;
  if (key.name === 'left' && cursor.x > 0) cursor.x--;
  if (key.name === 'right' && cursor.x < 5) cursor.x++;

  const { x, y } = cursor
  const isDeleteKey = key.name === 'x'
  
  if (allowedNumbers.includes(key.name)) {
    editStatus = updateCell(grid, y, x, parseInt(key.name))
    if (!editStatus) {
      if (isGridComplete(grid)) {
        render(grid, cursor, {
          type: 'completed',
          message: '¡Enhorabuena! Mini Sudoku completado'
        })

        process.exit(0)
      }
    }
  } else if (isDeleteKey) {
    editStatus = updateCell(grid, y, x, 0)
  } else if (key?.name.match(/^[a-z0-9]$/i)) {
    // Si pulsa cualquier otra letra o número no válido (ej: 'e', '7', '9')
    editStatus = {
      type: 'invalid_key',
      message: `La tecla ${key.name} no es válida. Usa números del 1 al 6.`
    }
  }

  render(grid, cursor, editStatus);
});
