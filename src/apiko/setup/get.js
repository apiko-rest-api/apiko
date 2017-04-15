'use strict'
module.exports = function (req, res, next) {
  let g = req.apiko

  if (g.config.protect) {
    if (req.all.secret !== g.manager.setup.secret) {
      res.error(401, 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.', 3)
      return
    }
  }

  res.success(g.manager.setup)
}
