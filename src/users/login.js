const bcrypt = require('bcryptjs')

module.exports = function (req, res, next) {
  let g = req.apiko;
  
  var password = g.app.hashPassword(req.all.password)
  
  g.store.users.findOne({ where: { username: req.all.username }}).then((user) => {
    if (user) {
      if (bcrypt.compareSync(req.all.password, user.password)) {
        let plainUser = JSON.parse(JSON.stringify(user))
        req.session.user = plainUser
        
        // don't show the password hash in the response
        delete plainUser.password

        res.status(200)
        res.body = JSON.stringify({ token: req.sessionID, user: plainUser })
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