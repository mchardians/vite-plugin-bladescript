import path from 'path';
import fg from 'fast-glob';

function vitePluginLaravelBladeScript(options = {}) {
    const entryPointsPattern = options.entryPoints || 'resources/js/**/*.js';

    return {
        name: 'vite-plugin-bladescript',
        
        configResolved(config) {
            
            const autoDiscoveredEntries = fg.sync(entryPointsPattern);
            
            let input = config.build.rollupOptions.input || [];
            
            if (typeof input === 'string') {
                input = [input];
            } else if (!Array.isArray(input)) {
                input = Object.values(input);
            }

            config.build.rollupOptions.input = [...new Set([...input, ...autoDiscoveredEntries])];
            
            config.build.rollupOptions.preserveEntrySignatures = 'strict';
        }
    };
}

export { vitePluginLaravelBladeScript };