const bcrypt = require('bcryptjs')

module.exports = function (req, res, next) {
  var password = g.app.hashPassword(req.all.password)
  
  g.store.users.findOne({ where: { username: req.all.username }}).then((user) => {
    g.log(3, 'User:', user)
    
    if (user) {
      if (bcrypt.compareSync(req.all.password, user.password)) {
        res.status(200)
        res.body = JSON.stringify({
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })
      } else {
        res.setError(401, 'Incorrect password.', 7)
      }
    } else {
      res.setError(404, 'There is no user with this username.', 6)
    }
    
    next()
  }).catch(() => {
    next()
  })
}