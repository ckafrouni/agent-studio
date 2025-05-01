import baseConfig from '@hono/eslint-config'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		// Ignore the config file itself from type-aware linting
		ignores: ['eslint.config.mjs'],
	},
	...baseConfig,
	{
		languageOptions: {
			parserOptions: {
				project: true, // Automatically find tsconfig.json
				tsconfigRootDir: import.meta.dirname,
			},
		},
		// If specific rule overrides are needed later, they can go here
		// For example:
		// rules: {
		//   '@typescript-eslint/no-unused-vars': 'warn',
		// },
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
			],
		},
	},
)
