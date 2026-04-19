const { override, useBabelRc } = require("customize-cra");

module.exports = override(useBabelRc(), (config) => {
    config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        process: require.resolve("process/browser"),
        util: require.resolve("util/"),
        buffer: require.resolve("buffer/"),
        stream: false,
        "readable-stream": false, 
    };

    // Also add alias to prevent any remaining imports
    config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "readable-stream$": "stream", 
    };

    return config;
});
