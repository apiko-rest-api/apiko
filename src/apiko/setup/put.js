module.exports = function (req, res, next) {
  let g = req.apiko;
  
  if (g.config.protect) {
    if (req.all.secret != g.manager.setup.secret) {
      res.error(401, 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.', 3)
      return
    }
  }

  if (req.all.setup) {
    g.app.reload(req.all.setup)
    res.success()
  } else {
    res.error(400, 'The \'setup\' parameter containing the actual setup is mandatory.', 4)
  }
}