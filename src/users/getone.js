'use strict'
module.exports = function genericGetOne (req, res, next) {
  let g = req.apiko

  g.store.users.findOne({
    where: {
      id: req.all.id
    },
    attributes: {
      exclude: ['password']
    }
  })
  .then(user => {
    if (user) {
      res.success(user)
    } else {
      res.error(404, 'No such user')
    }
  })
  .catch(e => {
    res.error(400, 'Can\'t get user')
  })
}
