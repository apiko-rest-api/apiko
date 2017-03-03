module.exports = function (req, res, next) {
  let g = req.apiko;
  
  g.log(2, 'Registering a user...')
  var password = g.app.hashPassword(req.all.password)
  
  var defaults = {
    where: { username: req.all.username },
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
  })
  
  next()
}