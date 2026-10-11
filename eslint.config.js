import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'build/photos_vk/**', 'build/pdf/**', '.lighthouseci/**'] },
  js.configs.recommended,
  {
    files: ['src/scripts/**/*.js'],
    languageOptions: { globals: { ...globals.browser, VK: 'readonly', ym: 'readonly' } },
  },
  {
    files: ['src/partials/**/*.js', 'build/**/*.mjs', 'tools/**/*.mjs', '*.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
