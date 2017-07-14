'use strict'
const path = require('path')
const fs = require('fs')

module.exports = function genericDelete (req, res, next) {
  let g = req.apiko
  let filesDir = process.cwd() + path.sep + g.config.filesDirectory + path.sep

  g.store.files.destroy({ where: { id: req.all.id } }).then(success => {
    if (success) {
      if (fs.existsSync(filesDir + req.all.id)) {
        fs.unlinkSync(filesDir + req.all.id)
        res.status(200)
      } else {
        res.setError(500)
        g.log.w(1, 'Attempted to delete a file, but it does not physically exist:', filesDir + req.all.id)
      }
    } else {
      res.setError(404, 'No such file.', 10)
      next()
    }
    next()
    return Promise.resolve()
  }).catch(e => {
    g.log.w(1, 'Error deleting a record in the DB (1):', e)
    res.status(400)
    next()
  })
}
