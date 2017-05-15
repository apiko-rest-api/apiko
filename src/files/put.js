'use strict'
module.exports = function (req, res, next) {
  res.setError(501, 'Not implemented. Overwriting files is not implemented by default.', 11)
  next()
}
