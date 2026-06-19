import { describe, it, expect } from 'vitest';
import { transformBladeImports } from '../src/transformer.js';

describe('Blade Import Transformer', () => {
    describe('1. Static Imports (Rules 1-7)', () => {
        it('Rule 1: Import Default', () => {
            const input = `import User from '@/User.js';`;
            const expected = `import User from "{{ Vite::asset('resources/js/User.js') }}";`;
            expect(transformBladeImports(input)).toBe(expected);
        });

        it('Rule 2: Import Named', () => {
            const input = `import { login, logout } from '@/auth.js';`;
            const expected = `import { login, logout } from "{{ Vite::asset('resources/js/auth.js') }}";`;
            expect(transformBladeImports(input)).toBe(expected);
        });

        it('Rule 3: Import Named With Alias (Multiline)', () => {
            const input = `import {\n    login as doLogin,\n    logout as doLogout\n} from '@/auth.js';`;
            const expected = `import {\n    login as doLogin,\n    logout as doLogout\n} from "{{ Vite::asset('resources/js/auth.js') }}";`;
            expect(transformBladeImports(input)).toBe(expected);
        });

        it('Rule 4 & 5: Import Default + Named / Alias', () => {
            const input = `import User, { login as doLogin } from '@/auth.js';`;
            const expected = `import User, { login as doLogin } from "{{ Vite::asset('resources/js/auth.js') }}";`;
            expect(transformBladeImports(input)).toBe(expected);
        });

        it('Rule 6 & 7: Namespace Import', () => {
            const input = `import User, * as Auth from '@/auth.js';`;
            const expected = `import User, * as Auth from "{{ Vite::asset('resources/js/auth.js') }}";`;
            expect(transformBladeImports(input)).toBe(expected);
        });
    });

    describe('2. Side Effect & Assets (Rules 8, 21-26)', () => {
        it('Rule 8: Side Effect Import', () => {
            const input = `import '@/bootstrap.js';`;
            const expected = `import "{{ Vite::asset('resources/js/bootstrap.js') }}";`;
            expect(transformBladeImports(input)).toBe(expected);
        });

        it('Rule 21-26: Asset Import', () => {
            const inputCSS = `import '@/app.css';`;
            const expectedCSS = `import "{{ Vite::asset('resources/js/app.css') }}";`;
            expect(transformBladeImports(inputCSS)).toBe(expectedCSS);

            const inputImg = `import logo from '@/logo.png';`;
            const expectedImg = `import logo from "{{ Vite::asset('resources/js/logo.png') }}";`;
            expect(transformBladeImports(inputImg)).toBe(expectedImg);
        });
    });

    describe('3. Dynamic Imports (Rules 9-13)', () => {
        it('Rule 9 & 10: Dynamic Import & Then', () => {
            const input = `const module = await import('@/auth.js');\nimport('@/auth.js').then(m => m.login());`;
            const expected = `const module = await import("{{ Vite::asset('resources/js/auth.js') }}");\nimport("{{ Vite::asset('resources/js/auth.js') }}").then(m => m.login());`;
            expect(transformBladeImports(input)).toBe(expected);
        });

        it('Rule 11-13: Dynamic Import Destructuring', () => {
            const input = `const {\n    default: User,\n    login\n} = await import('@/auth.js');`;
            const expected = `const {\n    default: User,\n    login\n} = await import("{{ Vite::asset('resources/js/auth.js') }}");`;
            expect(transformBladeImports(input)).toBe(expected);
        });
    });

    describe('4. Import Assertions / Attributes (Rules 19-20)', () => {
        it('Rule 19: JSON Static Import', () => {
            const input = `import config from '@/config.json' with { type: 'json' };`;
            const expected = `import config from "{{ Vite::asset('resources/js/config.json') }}" with { type: 'json' };`;
            expect(transformBladeImports(input)).toBe(expected);
        });

        it('Rule 20: JSON Dynamic Import', () => {
            const input = `const config = await import('@/config.json', { with: { type: 'json' } });`;
            const expected = `const config = await import("{{ Vite::asset('resources/js/config.json') }}", { with: { type: 'json' } });`;
            expect(transformBladeImports(input)).toBe(expected);
        });
    });

    describe('5. Re-exports (Rules 27-33)', () => {
        it('Rule 27-29: Re-export Named (Multiline)', () => {
            const input = `export {\n    login,\n    logout as doLogout\n} from '@/auth.js';`;
            const expected = `export {\n    login,\n    logout as doLogout\n} from "{{ Vite::asset('resources/js/auth.js') }}";`;
            expect(transformBladeImports(input)).toBe(expected);
        });

        it('Rule 30-33: Re-export Default & Namespace', () => {
            const input = `export * as Auth from '@/auth.js';\nexport { default as User } from '@/User.js';`;
            const expected = `export * as Auth from "{{ Vite::asset('resources/js/auth.js') }}";\nexport { default as User } from "{{ Vite::asset('resources/js/User.js') }}";`;
            expect(transformBladeImports(input)).toBe(expected);
        });
    });

    describe('6. Negative Tests (Should Not Transform)', () => {
        it('Rule 14-15: Relative & Absolute Paths', () => {
            const input = `import User from './User.js';\nimport User2 from '/src/User.js';`;
            const expected = `import User from './User.js';\nimport User2 from '/src/User.js';`;
            expect(transformBladeImports(input)).toBe(expected);
        });

        it('Rule 16-18: Package Imports', () => {
            const input = `import axios from 'axios';\nimport { defineConfig } from '@vitejs/plugin-vue';`;
            const expected = `import axios from 'axios';\nimport { defineConfig } from '@vitejs/plugin-vue';`;
            expect(transformBladeImports(input)).toBe(expected);
        });
    });
});