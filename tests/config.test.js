import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vitePluginLaravelBladeScript } from '../src/index.js';
import fg from 'fast-glob';
import path from 'path';

vi.mock('fast-glob', () => {
    return {
        default: {
            sync: vi.fn(),
        },
    };
});

describe('Vite Plugin Config Resolution', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('merges and deduplicates inputs correctly with Laravel array config', () => {
        fg.sync.mockReturnValue([
            'resources/js/app.js',
            'resources/js/components/Alert.js'
        ]);

        const plugin = vitePluginLaravelBladeScript();

        const mockConfig = {
            build: {
                rollupOptions: {
                    input: ['resources/css/app.css', 'resources/js/app.js']
                }
            }
        };

        plugin.configResolved(mockConfig);

        expect(mockConfig.build.rollupOptions.input).toEqual([
            'resources/css/app.css',
            'resources/js/app.js',
            'resources/js/components/Alert.js'
        ]);
    });

    it('normalizes string input into array before merging', () => {
        fg.sync.mockReturnValue(['resources/js/components/Alert.js']);

        const plugin = vitePluginLaravelBladeScript();

        const mockConfig = {
            build: {
                rollupOptions: {
                    input: 'resources/js/app.js'
                }
            }
        };

        plugin.configResolved(mockConfig);

        expect(mockConfig.build.rollupOptions.input).toEqual([
            'resources/js/app.js',
            'resources/js/components/Alert.js'
        ]);
    });

    it('normalizes object input into array before merging', () => {
        fg.sync.mockReturnValue(['resources/js/components/Alert.js']);

        const plugin = vitePluginLaravelBladeScript();

        const mockConfig = {
            build: {
                rollupOptions: {
                    input: {
                        app: 'resources/js/app.js',
                        theme: 'resources/css/app.css'
                    }
                }
            }
        };

        plugin.configResolved(mockConfig);

        expect(mockConfig.build.rollupOptions.input).toEqual([
            'resources/js/app.js',
            'resources/css/app.css',
            'resources/js/components/Alert.js'
        ]);
    });

    it('automatically sets preserveEntrySignatures to strict to prevent export stripping', () => {
        fg.sync.mockReturnValue(['resources/js/components/Alert.js']);

        const plugin = vitePluginLaravelBladeScript();

        const mockConfig = {
            build: {
                rollupOptions: {
                    input: ['resources/js/app.js']
                }
            }
        };

        plugin.configResolved(mockConfig);

        expect(mockConfig.build.rollupOptions.preserveEntrySignatures).toBe('strict');
    });

    it('respects custom entryPoints option pattern', () => {
        const customPattern = 'frontend/scripts/**/*.js';
        const plugin = vitePluginLaravelBladeScript({ entryPoints: customPattern });
        const mockConfig = { build: { rollupOptions: { input: [] } } };
        
        plugin.configResolved(mockConfig);
        
        expect(fg.sync).toHaveBeenCalledWith(customPattern);
    });
});