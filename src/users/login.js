'use strict'
const bcrypt = require('bcryptjs')

module.exports = function (req, res, next) {
  let g = req.apiko

  // let password = g.app.hashPassword(req.all.password) // unused

  g.store.users.findOne({ where: { username: req.all.username } }).then((user) => {
    if (user) {
      if (bcrypt.compareSync(req.all.password, user.password)) {
        let plainUser = JSON.parse(JSON.stringify(user))
        req.session.user = plainUser

        // don't show the password hash in the response
        delete plainUser.password

        // if there are no roles in the role field, it's represented as a 'null',
        // which would be correct, but would make us to first check if the role
        // is null and then if role.indexOf('wantedRole') >= 0... everywhere.
        // So it's better to just set it to string here and we have one IF instead
        // of two IFs for each role check.
        if (typeof plainUser.role !== 'string') {
          plainUser.role = ''
        }

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
