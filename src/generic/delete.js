module.exports = function (req, res, next) {
  var collection = g.ender.endFromReq(req).split('/')[1]
  
  g.log(3, 'Generic DELETE /' + collection + '/:id')
  
  if (!g.store[collection]) {
    res.setError(404, 'Undefined collection.', 6)
  }
  
  g.store[collection].destroy({ where: { id: req.all.id } }).then(record => {
    if (records) {
      next()
    } else {
      res.setError(404, 'No such record.', 10)
      next()
    }
  }).catch(e => {
    g.log.w(1, 'Error deleting a record in the DB (1):', e)
    res.status(400)
    next()
  })
}