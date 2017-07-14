'use strict'
module.exports = function genericGetOne (req, res, next) {
  let g = req.apiko

  let username = String(req.all.username)
  if (username.indexOf('@') !== -1) {
    username = username.toLowerCase()
  }

  g.store.users.findOne({
    where: {
      username: username
    }
  })
  .then(user => {
    if (user) {
      res.success({ exists: true })
    } else {
      res.success({ exists: false })
    }
    return Promise.resolve()
  })
  .catch(e => {
    res.error(400, 'Can\'t check if user exists')
  })
}
