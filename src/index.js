import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { transformBladeImports } from './transformer.js';

export default function vitePluginBladeScript(options = {}) {
    const viewsPath = options.viewsPath || 'resources/views/**/*.blade.php';
    const jsPath = options.jsPath || 'resources/js/**/*.js';

    const processBladeFile = (absolutePath) => {
        const content = fs.readFileSync(absolutePath, 'utf-8');
        const transformed = transformBladeImports(content);

        if (content !== transformed) {
            fs.writeFileSync(absolutePath, transformed, 'utf-8');
            return true;
        }
        return false;
    };

    return {
        name: 'vite-plugin-blade-script',
        
        config: (config) => {
            const jsFiles = fg.sync(jsPath);
            
            if (!config.build) config.build = {};
            if (!config.build.rollupOptions) config.build.rollupOptions = {};
            
            const existingInputs = Array.isArray(config.build.rollupOptions.input) 
                ? config.build.rollupOptions.input 
                : [];

            config.build.rollupOptions.input = [
                ...existingInputs,
                ...jsFiles
            ];
        },

        resolveId(source) {
            if (source.startsWith('@/')) {
                return source.replace('@', path.resolve(process.cwd(), 'resources/js'));
            }
            return null;
        },

        buildStart() {
            const files = fg.sync(viewsPath);
            files.forEach(file => {
                processBladeFile(path.resolve(process.cwd(), file));
            });
        },

        handleHotUpdate({ file, server }) {

            if (file.endsWith('.blade.php')) {
                const wasModified = processBladeFile(file);

                if (wasModified) {
                    return [];
                }
            }
        }
    };
}