module.exports = function genericGet (req, res, next) {
  let g = req.apiko;
  
  var collection = g.ender.endFromReq(req).split('/')[1]
  
  g.log(3, 'Generic GET /' + collection)
  
  if (!g.store[collection]) {
    res.setError(404, 'Undefined collection.', 6)
  }
  
  var opts = {}
  
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
  
  g.store[collection].findAll(opts).then(records => {
    if (records.length) {
      res.status(200)
      res.body = JSON.stringify(records)
    } else {
      res.status(404)
      res.body = JSON.stringify(records)
    }
  
    next()
  }).catch(e => {
    next()
  })
}