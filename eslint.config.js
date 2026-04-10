const globals = require("globals");
const pluginJs = require("@eslint/js");
const reactPlugin = require("eslint-plugin-react");

module.exports = [
    pluginJs.configs.recommended,
    {
        files: ["**/*.js", "**/*.jsx"],
        ignores: ["**/*.test.js"],
        plugins: {
            react: reactPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error",
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error",
            "react/jsx-no-undef": "error",
            "no-unused-expressions": "error",
            "no-useless-escape": "off",
            "no-inline-comments": "off",
            "no-restricted-globals": "off",
        },
    },
];
