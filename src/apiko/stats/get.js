const deepmerge = require('deepmerge')

module.exports = function (req, res, next) {
  let g = req.apiko;
  
  if (g.config.protect) {
    if (req.all.secret != g.manager.setup.secret) {
      res.error(401, 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.', 3)
      return
    }
  }

  var startDate = parseInt(req.all.start) || new Date().setDate(new Date().getDate() - 30).valueOf()
  var endDate = parseInt(req.all.end) || new Date().valueOf()

  g.store.stats.findAll({
    where: {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }
  })
  .then(function(stats) {
    res.success(stats)
  })
  .catch(function(err) {
    res.error(400, 'Error: can\'t return stats')
  })
}