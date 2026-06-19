import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from 'vite';
import laravel from 'laravel-vite-plugin';
import fs from 'fs';
import path from 'path';
import vitePluginBladeScript from '../src/index.js';

describe('Vite Plugin Auto-Registration', () => {
    const cwd = process.cwd();
    const jsDir = path.join(cwd, 'resources/js/temp_testing');
    const publicDir = path.join(cwd, 'public/build');
    
    const jsFile = path.join(jsDir, 'CardBottomSheet.js');

    beforeAll(() => {
        fs.mkdirSync(jsDir, { recursive: true });
        fs.writeFileSync(jsFile, `export class CardBottomSheet {}`);
    });

    afterAll(() => {
        fs.rmSync(jsDir, { recursive: true, force: true });
        if (fs.existsSync(path.join(cwd, 'public'))) {
            fs.rmSync(path.join(cwd, 'public'), { recursive: true, force: true });
        }
    });

    it('executes build lifecycle and registers JS to manifest automatically', async () => {
        await build({
            root: cwd,
            plugins: [
                vitePluginBladeScript(),
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

        const manifestPath = path.join(publicDir, 'manifest.json');
        
        expect(fs.existsSync(manifestPath)).toBe(true);

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        
        expect(manifest['resources/js/temp_testing/CardBottomSheet.js']).toBeDefined();
        expect(manifest['resources/js/temp_testing/CardBottomSheet.js'].isEntry).toBe(true);
    });
});