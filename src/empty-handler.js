'use strict'
const { EmptyHandler } = require('./errors')
module.exports = function deleteUsers (req, res, next) {
  const e = new EmptyHandler()
  res.body = res.setError(e.statusCode, e.message, e.errorCode)
  next()
}
