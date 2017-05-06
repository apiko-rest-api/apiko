'use strict'
const path = require('path')
const fs = require('fs')

module.exports = function (req, res, next) {
  let g = req.apiko
  let filesDir = process.cwd() + path.sep + g.config.filesDirectory + path.sep

  g.store.files.findOne({ where: {id: req.all.id} }).then(record => {
    if (record) {
      if (fs.existsSync(filesDir + record.id)) {
        res.status(200)
        res.setHeader('Content-Length', record.size)
        res.setHeader('Content-Type', record.mime)
        res.setHeader('Content-Disposition', 'inline; filename="' + record.name + '"')
        res.body = fs.readFileSync(filesDir + record.id)
      } else {
        res.setError(500)
        g.log.w(1, 'A requested file does not physically exist:', filesDir + record.id)
      }
    } else {
      res.setError(404, 'No such file.', 10)
    }

    next()
    return Promise.resolve()
  }).catch(next)
}
