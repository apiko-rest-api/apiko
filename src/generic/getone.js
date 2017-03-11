module.exports = function genericGetOne (req, res, next) {
  let g = req.apiko
  
  var collection = g.ender.endFromReq(req).split('/')[1]
  
  g.log(3, 'Generic GET /' + collection + '/:id')
  
  if (!g.store[collection]) {
    res.setError(404, 'Undefined collection.', 6)
  }
  
  g.store[collection].findOne({ where: {id: req.all.id} }).then(record => {
    if (record) {
      res.status(200)
      res.body = JSON.stringify(record)
    } else {
      res.setError(404, 'No such record.', 10)
    }
  
    next()
  }).catch(e => {
    next()
  })
}