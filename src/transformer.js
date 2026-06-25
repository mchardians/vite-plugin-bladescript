function transformBladeImports(bladeContent) {
    let content = bladeContent;

    const formatAsset = (path) => {
        if (!path.match(/\.[a-zA-Z0-9]+$/)) {
            path += '.js';
        }
        return `{{ Vite::asset('resources/js/${path}') }}`;
    };

    content = content.replace(
        /(import|export)\s+(.*?)\s+from\s+['"]@\/(.*?)['"]/gs,
        (match, p1, p2, p3) => `${p1} ${p2} from "${formatAsset(p3)}"`
    );

    content = content.replace(
        /import\(\s*['"]@\/(.*?)['"]/g,
        (match, p1) => `import("${formatAsset(p1)}"`
    );

    content = content.replace(
        /import\s+['"]@\/(.*?)['"]/g,
        (match, p1) => `import "${formatAsset(p1)}"`
    );

    return content;
}

export { transformBladeImports };