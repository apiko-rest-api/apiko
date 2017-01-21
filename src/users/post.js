module.exports = function (req, res, next) {
  g.log(2, 'Registering a user...')
  var password = g.app.hashPassword(req.all.username, req.all.password)
  
  g.data.store.models.users.findOrCreate({
    where: { username: req.all.username },
    defaults: { password: password }
  }).spread((users, created) => {
    if (created) { // successfully registered
      res.status(200)
    } else { // username taken
      res.setError(409, 'This username is already registered.', 5)
    }
  })
  
  next()
}