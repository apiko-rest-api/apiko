'use strict'
module.exports = function genericGet (req, res, next) {
  let g = req.apiko
  let opts = {}

  if (req.all.where) {
    try {
      opts.where = JSON.parse(req.all.where)
    } catch (e) {
      opts.where = {}
    }
  }

  if (req.all.limit) {
    opts.limit = req.all.limit
  }

  if (req.all.offset) {
    opts.offset = req.all.offset
  }

  if (req.all.order) {
    opts.order = req.all.order
  }

  if (req.all.group) {
    opts.group = req.all.group
  }

  opts.attributes = {
    exclude: ['password']
  }

  g.store.users.findAll(opts).then(users => {
    res.success(users)
    return Promise.resolve()
  }).catch(e => {
    res.error(404, 'Can\'t get users')
  })
}
