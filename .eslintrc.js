module.exports = {
    parser: "@babel/eslint-parser",
    extends: "airbnb",
    rules: {
        // override default options
        "comma-dangle": ["error", "always"],
        "indent": ["error", 2],
        "no-cond-assign": ["error", "always"],

        // disable now, but enable in the future
        "one-var": "off", // ["error", "never"]

        // disable
        "init-declarations": "off",
        "no-console": "off",
        "no-inline-comments": "off",
    },
    env: {
        "browser": true,
        "node": true
    }
}
