module.exports = {
  "env": {
    "node": true,
    "mocha": true
  },
  "extends": ["standard", "plugin:promise/recommended"],
  "plugins": [
    "mocha",
    "chai-expect",
    "chai-friendly",
    "standard",
    "promise",
    "import",
    "node"
  ],
  "rules": {
    "mocha/no-exclusive-tests": "error",
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2,
    "chai-expect/missing-assertion": 2,
    "chai-expect/terminating-properties": 1,
    "import/no-unresolved": [2, { commonjs: true }],
    "import/named": 2,
    "import/namespace": 2,
    "import/default": 2,
    "import/export": 2
}
};
