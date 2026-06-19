import path from 'path';
import fg from 'fast-glob';

export default function vitePluginBladeScript(options = {}) {
    const jsPath = options.jsPath || 'resources/js/**/*.js';

    return {
        name: 'vite-plugin-blade-script',
        
        config: () => {
            const jsFiles = fg.sync(jsPath);
            
            return {
                build: {
                    rollupOptions: {
                        input: jsFiles
                    }
                }
            };
        },

        resolveId(source) {
            if (source.startsWith('@/')) {
                return source.replace('@', path.resolve(process.cwd(), 'resources/js'));
            }
            return null;
        }
    };
}