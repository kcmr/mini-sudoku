import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: 'unit',
					environment: 'node',
					include: ['tests/unit/**/*.test.ts'],
				},
			},
			{
				test: {
					name: 'e2e',
					environment: 'node',
					include: ['tests/e2e/**/*.test.ts'],
					testTimeout: 10000,
				},
			},
		],
		coverage: {
			provider: 'v8',
			include: ['src/**'],
			reporter: ['text', 'html'],
			reportsDirectory: './coverage',
		},
	},
})
