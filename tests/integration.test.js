import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from 'vite';
import laravel from 'laravel-vite-plugin';
import fs from 'fs';
import path from 'path';
import laravelBladeJavascriptPlugin from '../src/index.js';

describe('Vite and Laravel Plugin Integration', () => {
    const cwd = process.cwd();
    const viewsDir = path.join(cwd, 'resources/views/temp_testing');
    const jsDir = path.join(cwd, 'resources/js/temp_testing');
    const publicDir = path.join(cwd, 'public/build');
    
    const bladeFile = path.join(viewsDir, 'test.blade.php');
    const jsFile = path.join(jsDir, 'CardBottomSheet.js');

    beforeAll(() => {
        fs.mkdirSync(viewsDir, { recursive: true });
        fs.mkdirSync(jsDir, { recursive: true });

        fs.writeFileSync(
            bladeFile,
            `<script type="module">\n    import { CardBottomSheet as CardComponent } from '@/temp_testing/CardBottomSheet';\n</script>`
        );

        fs.writeFileSync(
            jsFile,
            `export class CardBottomSheet {}`
        );
    });

    afterAll(() => {
        fs.rmSync(viewsDir, { recursive: true, force: true });
        fs.rmSync(jsDir, { recursive: true, force: true });
        if (fs.existsSync(path.join(cwd, 'public'))) {
            fs.rmSync(path.join(cwd, 'public'), { recursive: true, force: true });
        }
    });

    it('executes full build lifecycle correctly', async () => {
        await build({
            root: cwd,
            plugins: [
                laravelBladeJavascriptPlugin(),
                laravel({
                    input: [],
                    publicDirectory: 'public',
                    buildDirectory: 'build',
                })
            ],
            resolve: {
                alias: {
                    '@': path.resolve(cwd, 'resources/js'),
                },
            },
            logLevel: 'silent',
        });

        const transformedBlade = fs.readFileSync(bladeFile, 'utf-8');
        expect(transformedBlade).toContain(`import { CardBottomSheet as CardComponent } from "{{ Vite::asset('resources/js/temp_testing/CardBottomSheet.js') }}"`);

        const manifestPath = path.join(publicDir, 'manifest.json');
        expect(fs.existsSync(manifestPath)).toBe(true);

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        expect(manifest['resources/js/temp_testing/CardBottomSheet.js']).toBeDefined();
        expect(manifest['resources/js/temp_testing/CardBottomSheet.js'].isEntry).toBe(true);
    });
});