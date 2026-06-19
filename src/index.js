import path from 'path';
import fg from 'fast-glob';

export default function laravelBladeJavascriptPlugin(options = {}) {
    const jsPath = options.jsPath || 'resources/js/**/*.js';

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
        }
    };
}