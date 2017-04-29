'use strict'
module.exports = function genericGet (req, res, next) {
  let g = req.apiko

  let collection = g.ender.endFromReq(req).split('/')[1]

  g.log(3, 'Generic GET /' + collection)

  if (!g.store[collection]) {
    res.setError(404, 'Undefined collection.', 6)
  }

  let opts = {}

  if (req.all.where) {
    try {
      opts.where = JSON.parse(req.all.where)
    } catch (e) {
      opts.where = {}
    }
  }

  if (req.checkOwnership === true) {
    let userId = req.session.user ? req.session.user.id : null
    opts.where = opts.where || {}
    opts.where.owner = userId
  }

  if (req.all.limit) {
    console.log(req.all.limit)
    opts.limit = parseInt(req.all.limit)
  }

  if (req.all.offset) {
    opts.offset = parseInt(req.all.offset)
  }

  if (req.all.order) {
    opts.order = req.all.order
  }

  if (req.all.group) {
    opts.group = req.all.group
  }

  g.store[collection].findAll(opts).then(records => {
    if (records.length) {
      res.status(200)
      res.body = JSON.stringify(records)
    } else {
      res.status(404)
      res.body = JSON.stringify(records)
    }

    next()
    return Promise.resolve()
  }).catch(e => {
    next()
  })
}
