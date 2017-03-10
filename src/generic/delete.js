module.exports = function genericDelete (req, res, next) {
  let g = req.apiko;
  
  var collection = g.ender.endFromReq(req).split('/')[1]
  
  g.log(3, 'Generic DELETE /' + collection + '/:id')
  
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
        record.destroy().then(() => {
          next()
        }).catch(e => {
          g.log.w(1, 'Error deleting a record in the DB (1):', e)
          res.status(400)
          next()
        })
      }
    } else {
      res.error(404, 'No such record.', 10)
    }
  }).catch(e => {
    next()
  })
}