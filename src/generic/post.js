module.exports = function genericPost (req, res, next) {
  let g = req.apiko;
  
  console.log(req.route)
  
  var collection = g.ender.endFromReq(req).split('/')[1]
  
  g.log(3, 'Generic POST /' + collection)

  if (!g.store[collection]) {
    res.setError(404, 'Undefined collection.', 6)
  }

  var data = {}
  for (let column in g.data.collections[collection]) {
    data[column] = req.all[column]
  }
  
  data.owner = 0
  if (req.session.user) {
    data.owner = req.session.user.id
  }

  g.store[collection].create(data).then(record => {
    res.status(200)
    res.body = JSON.stringify(record, (k, v) => {
      if (v === undefined) {
        return null
      }
      return v
    })
    
    next()
  }).catch(e => {
    g.log.w(1, 'Error inserting a record to the DB:', e)
    res.status(400)
    next()
  })
}