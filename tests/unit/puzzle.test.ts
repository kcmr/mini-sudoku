import { beforeEach, describe, expect, it } from 'vitest'
import { Puzzle } from '#src/puzzle.js'
import type { Grid } from '#src/types.js'
import {
	COMPLETE_GRID,
	collisionCase,
	firstEditable,
	firstNonEditable,
	validCase,
} from '#tests/helpers/puzzle-helpers.js'

describe('Puzzle', () => {
	let puzzle: Puzzle

	beforeEach(() => {
		puzzle = new Puzzle()
	})

	describe('isEditable', () => {
		it('returns true for cells that were empty in the initial grid', () => {
			const { row, col } = firstEditable(puzzle)
			expect(puzzle.initialGrid[row][col]).toBe(0)
			expect(puzzle.isEditable(row, col)).toBe(true)
		})

		it('returns false for cells that had a value in the initial grid', () => {
			const { row, col } = firstNonEditable(puzzle)
			expect(puzzle.initialGrid[row][col]).not.toBe(0)
			expect(puzzle.isEditable(row, col)).toBe(false)
		})
	})

	describe('deleteValue', () => {
		it('clears an editable cell and returns null', () => {
			const { row, col } = firstEditable(puzzle)
			puzzle.grid[row][col] = 3
			const result = puzzle.deleteValue(row, col)
			expect(result).toBeNull()
			expect(puzzle.grid[row][col]).toBe(0)
		})

		it('returns a readonly_cell status for a non-editable cell', () => {
			const { row, col } = firstNonEditable(puzzle)
			const result = puzzle.deleteValue(row, col)
			expect(result?.type).toBe('readonly_cell')
		})
	})

	describe('setCell', () => {
		it('returns a readonly_cell status for a non-editable cell', () => {
			const { row, col } = firstNonEditable(puzzle)
			const result = puzzle.setCell(row, col, 1)
			expect(result?.type).toBe('readonly_cell')
		})

		it('sets the value and returns null for a valid placement', () => {
			const { row, col, value } = validCase(puzzle)
			const result = puzzle.setCell(row, col, value)
			expect(result).toBeNull()
			expect(puzzle.grid[row][col]).toBe(value)
		})

		it('sets the value and returns a collision status for a conflicting value', () => {
			const { row, col, value } = collisionCase(puzzle)
			const result = puzzle.setCell(row, col, value)
			expect(result?.type).toBe('collision')
			expect(puzzle.grid[row][col]).toBe(value) // value is still written before validation
		})
	})

	describe('isValid', () => {
		it('returns false when the value already exists in the same row', () => {
			puzzle.grid = COMPLETE_GRID
			// Row 0 = [1,2,3,4,5,6]; value 2 exists at [0][1], so [0][0]=2 is a conflict
			expect(puzzle.isValid(0, 0, 2)).toBe(false)
		})

		it('returns true when the value does not conflict', () => {
			puzzle.grid = COMPLETE_GRID
			// [0][0] currently holds 1; isValid checks OTHER cells, so 1 at [0][0] is valid
			expect(puzzle.isValid(0, 0, 1)).toBe(true)
		})
	})

	describe('isComplete', () => {
		it('returns false for a fresh puzzle with removed cells', () => {
			expect(puzzle.isComplete()).toBe(false)
		})

		it('returns true for a fully and correctly filled grid', () => {
			puzzle.grid = COMPLETE_GRID
			expect(puzzle.isComplete()).toBe(true)
		})

		it('returns false for a grid with conflicting values', () => {
			const grid = COMPLETE_GRID.map((row) => [...row]) as Grid
			grid[0][0] = 2 // duplicate 2 in row 0 (original is 1)
			puzzle.grid = grid
			expect(puzzle.isComplete()).toBe(false)
		})
	})
})
