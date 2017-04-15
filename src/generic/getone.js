'use strict'
module.exports = function genericGetOne (req, res, next) {
  let g = req.apiko

  let end = g.ender.endFromReq(req)
  // let endpoint = g.ender.endpoints[end] // no need of unassigned variable
  let collection = end.split('/')[1]

  g.log(3, 'Generic GET /' + collection + '/:id')

  if (!g.store[collection]) {
    res.setError(404, 'Undefined collection.', 6)
  }

  g.store[collection].findOne({ where: {id: req.all.id} }).then(record => {
    if (record) {
      let userId = req.session.user ? req.session.user.id : null

      if (req.checkOwnership === true && record.owner !== userId) {
        g.log.w(1, "This user doesn't seem to have sufficient rights.")
        res.error(403, "This user doesn't seem to have sufficient rights.")
      } else {
        res.status(200)
        res.body = JSON.stringify(record)
      }
    } else {
      res.error(404, 'No such record.', 10)
    }

    next()
  }).catch(e => {
    next()
  })
}
