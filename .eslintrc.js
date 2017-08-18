module.exports = {
    "extends": "airbnb-base",
    "env": {
        "es6": true,
        "node": true,
        "mocha": true,
    },
    "plugins": [
        "import",
        "mocha"
    ],
    "rules": {
      "no-console": "off",
      "no-param-reassign": "off",
      "import/no-extraneous-dependencies": ["error", {"devDependencies": ["**/*.test.js", "**/*.spec.js"]}]
      
    }
};