'use strict'
const deepmerge = require('deepmerge')

module.exports = function (req, res, next) {
  let g = req.apiko

  if (g.config.protect) {
    if (req.all.secret !== g.manager.setup.secret) {
      res.error(401, 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.', 3)
      return
    }
  }

  // copy the object so we don't modify the original one
  let core = JSON.parse(JSON.stringify(g.core))

  // add generic endpoints
  core.endpoints = deepmerge.all([g.ender.genericCollectionEndpoints(), core.endpoints])

  res.success(core)
}
