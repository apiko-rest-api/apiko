const deepmerge = require('deepmerge')

module.exports = function (req, res, next) {
  if (g.config.protect) {
    if (req.all.secret != g.manager.setup.secret) {
      res.error(401, 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.', 3)
      return
    }
  }
  
  // copy the object so we don't modify the original one
  var core = JSON.parse(JSON.stringify(g.core))
  
  // add generic endpoints
  var endpoints = deepmerge.all([g.ender.genericCollectionEndpoints(), core.endpoints])
  core.endpoints = endpoints

  res.success(core)
}