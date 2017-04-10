module.exports = {
  "env": {
    "node": true,
    "mocha": true
  },
  "extends": "standard",
  "plugins": [
    "mocha",
    "chai-expect",
    "chai-friendly",
    "standard",
    "promise"
  ],
  "rules": {
    "mocha/no-exclusive-tests": "error",
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2,
    "chai-expect/missing-assertion": 2,
    "chai-expect/terminating-properties": 1
  }
};