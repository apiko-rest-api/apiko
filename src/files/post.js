'use strict'
const path = require('path')
const formidable = require('formidable')
const fs = require('fs')

module.exports = function (req, res, next) {
  let g = req.apiko

  let uploadedFiles = []

  // create an incoming form object
  var form = new formidable.IncomingForm()

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true

  // store all uploads in the /uploads directory
  form.uploadDir = process.cwd() + path.sep + g.config.filesDirectory + path.sep

  // create the directory if it doesn't exist yet
  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir)
  }

  // every time a file has been uploaded successfully,
  // insert it to the DB and rename the physical file
  // to its ID
  form.on('file', (field, file) => {
    uploadedFiles.push(file)
  })

  // log any errors that occur
  form.on('error', (err) => {
    g.log.w(1, 'Failed to upload file.', err)
    if (!res.headersSent) {
      res.setError(500, 'The file upload failed. (whole)', 12)
    }
    next()
  })

  // canceled by the client
  form.on('aborted', () => {
    res.setError(400, 'The file upload has been aborted by the client (timeout or close event on the socket).', 13)
    next()
  })

  // once all the files have been uploaded, send a response to the client
  form.on('end', () => {
    let finishedFiles = []
    let dbInsertionPromises = []

    for (let file in uploadedFiles) {
      let insert = g.store.files.create({
        mime: uploadedFiles[file].type,
        owner: (req.session.user ? req.session.user.id : 0),
        name: uploadedFiles[file].name,
        size: uploadedFiles[file].size
      })

      insert.then(record => {
        fs.renameSync(uploadedFiles[file].path, path.join(form.uploadDir, record.id.toString()))
        finishedFiles.push(JSON.parse(JSON.stringify(record)))
      })

      insert.catch(e => {
        g.log.w(1, 'Error inserting a file to the DB:', e)
        if (!res.headersSent) {
          res.setError(500, 'The file upload failed. (single file)', 12)
        }
        next()
      })

      dbInsertionPromises.push(insert)
    }

    Promise.all(dbInsertionPromises).then(() => {
      res.status(200)
      res.body = JSON.stringify(finishedFiles)
      next()
    })
  })

  // parse the incoming request containing the form data
  form.parse(req)
}
