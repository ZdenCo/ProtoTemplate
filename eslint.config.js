import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Architecture boundaries (also checked by `npm run validate`):
//   pages   -> '@core/ui' only (layout + zones, no logic)
//   modules -> '@core', '@core/ui', '@core/recipes/<id>', '@core/connectors/<id>' (types), own files
//   core    -> never imports modules; non-prunable core never imports a connector or recipe folder
const moduleRules = {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        { regex: '^@(protoshell|capacitor|capgo|capacitor-community)/', message: 'Use connectors: useConnector(id) from @core.' },
        { regex: '^@modules/', message: 'Modules must not import other modules. Use events (useEmit/useEvent).' },
        { regex: '^@app/', message: 'Modules must not import app files.' },
        { regex: '^@core/(app|dev|platform|storage|validate|define)(/|$)', message: 'Core internals are private. Import from @core.' },
        { regex: '^@core/modules/(?!events$)', message: 'Import from @core.' },
        { regex: '^@core/connectors/[^/]+/.+', message: "Import connector types from '@core/connectors/<id>'." },
        { regex: '^@core/testing', message: '@core/testing is for *.test.tsx files only.' },
        { regex: '^\\.\\./\\.\\./\\.\\./', message: 'Stay inside the module folder.' },
      ],
    },
  ],
};

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'vendor', 'test-results', 'playwright-report', 'e2e/screenshots', '.vitest'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['scripts/**', 'vite.config.ts', 'playwright.config.ts', 'e2e/**', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['src/pages/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ regex: '^(?!@core/ui$)', message: "Pages are layouts: import only PageLayout and Zone from '@core/ui'." }] }],
    },
  },
  { files: ['modules/**'], rules: moduleRules },
  {
    files: ['modules/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: moduleRules['no-restricted-imports'][1].patterns.filter((p) => !p.regex.startsWith('^@core/testing')) },
      ],
    },
  },
  {
    files: ['src/core/**'],
    ignores: ['src/core/recipes/**', 'src/core/connectors/*/**', 'src/core/testing/**', 'src/core/validate/**', 'src/core/**/*.test.*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex: '^@modules/', message: 'Core never imports modules (the registry finds them with import.meta.glob).' },
            { regex: '(^|/)recipes(/|$)', message: 'Recipes can be pruned: core must not import them.' },
            { regex: '(^|/)connectors/(?!(registry|hooks|types|index|mock-utils)$)[^/]+', message: 'Connectors can be pruned: use getConnector(id) instead.' },
          ],
        },
      ],
    },
  },
);
