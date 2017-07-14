'use strict'
module.exports = function (req, res, next) {
  let g = req.apiko

  g.log(2, 'Registering a user...')
  let password = g.app.hashPassword(req.all.password)

  let username = String(req.all.username)
  if (username.indexOf('@') !== -1) {
    username = username.toLowerCase()
  }

  let defaults = {
    where: { username: username },
    defaults: { password: password, name: req.all.name }
  }

  g.store.users.findOrCreate(defaults).spread((users, created) => {
    if (created) { // successfully registered
      res.status(200)
    } else { // username taken
      res.setError(409, 'This username is already registered.', 5)
    }
  }).catch(error => {
    g.log.w(1, 'Registration error:', error)
  }).then(next)
}
