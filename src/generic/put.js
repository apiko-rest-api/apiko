module.exports = function (req, res, next) {
  var collection = g.ender.endFromReq(req).split('/')[1]
  
  g.log(3, 'Generic PUT /' + collection + '/:id')
  
  if (!g.store[collection]) {
    res.setError(404, 'Undefined collection.', 6)
  }
  
  var data = {}
  for (let column in g.data.collections[i]) {
    if (column !== 'id') {
      data[column] = req.all[column]
    }
  }
  
  g.store[collection].find({ where: { id: req.all.id } }).then(record => {
    if (record) {
      record.project.updateAttributes(data).then(() => {
        res.status(200)
        next()
      }).catch(e => {
        g.log.w(1, 'Error updating a record in the DB (2):', e)
        next()
      })
    } else {
      res.setError(404, 'No such record.', 10)
      next()
    }
  }).catch(e => {
    g.log.w(1, 'Error updating a record in the DB (1):', e)
    res.status(400)
    next()
  })
}