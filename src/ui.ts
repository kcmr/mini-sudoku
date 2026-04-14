import dedent from "dedent";
import pc from 'picocolors';
import { type Grid } from './engine.js';

type Cursor = {
  x: number,
  y: number
}

export function render(grid: Grid, cursor: Cursor, errorMessage = '') {
  console.clear();

  const templateParts = {
    top:            '┏━━━┯━━━┯━━━┳━━━┯━━━┯━━━┓',
    row:            '┃ n │ n │ n ┃ n │ n │ n ┃',
    rowSeparator:   '┠───┼───┼───╂───┼───┼───┨',
    blockSeparator: '┣━━━━━━━━━━━╋━━━━━━━━━━━┫',
    bottom:         '┗━━━┷━━━┷━━━┻━━━┷━━━┷━━━┛'
  }

  const template = [templateParts.top];

  for (let row = 0; row < 6; row++) {

    let colIndex = 0;

    const rowString = templateParts.row.replace(/n/g, () => {
      const value = grid[row][colIndex];
      let displayValue = value === 0 ? ' ' : value.toString();

      if (cursor && cursor.y === row && cursor.x === colIndex) {
        displayValue = pc.inverse(displayValue);
      }

      colIndex++;
      return displayValue;
    });

    template.push(rowString);

    if (row === 5) {
      template.push(templateParts.bottom);
    } else if (row === 1 || row === 3) {
      template.push(templateParts.blockSeparator);
    } else {
      template.push(templateParts.rowSeparator);
    }
  }
  
  console.log(dedent`${template.join(`\n`)}`)
  
  if (errorMessage) {
    console.log(`\n${pc.red(errorMessage)}`)
  }
}