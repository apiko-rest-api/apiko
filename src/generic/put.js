'use strict'

function isRestrict (req, column) {
  try {
    const params = req.apiko.ender.endpoints[req.apiko.ender.endFromReq(req)].params
    let restrict
    if (!(params && params[column] && (restrict = params[column].restrict))) return false

    if (!(req.session && req.session.user && req.session.user.role)) return true
    const userRoles = req.session.user.role.split(',')
    const allowedToRoles = restrict.split(',')
    let isRestrictToUser = true
    for (let role in allowedToRoles) {
      if (userRoles.indexOf(role) > -1) {
        isRestrictToUser = false
        break
      }
    }
    return isRestrictToUser
  } catch (error) {
    req.apiko.log(1, 'Internal server error: ' + error.message)
    return false
  }
}

module.exports = function genericPut (req, res, next) {
  let g = req.apiko

  let collection = g.ender.endFromReq(req).split('/')[1]

  g.log(3, 'Generic PUT /' + collection + '/:id')

  if (!g.store[collection]) {
    res.setError(404, 'Undefined collection.', 6)
  }

  let data = {}
  for (let column in g.data.collections[collection]) {
    if (column !== 'id') {
      if (isRestrict(req, column)) continue
      data[column] = req.all[column]
    }
  }

  g.store[collection].find({ where: { id: req.all.id } }).then(record => {
    if (record) {
      let userId = req.session.user ? req.session.user.id : null

      if (req.checkOwnership === true && record.owner !== userId) {
        g.log.w(1, "This user doesn't seem to have sufficient rights.")
        res.error(403, "This user doesn't seem to have sufficient rights.")
      } else {
        record.update(data).then(() => {
          res.status(200)
          res.body = JSON.stringify(record, (k, v) => {
            if (v === undefined) {
              return null
            }
            return v
          })
          next()
          return Promise.resolve()
        }).catch(e => {
          g.log.w(1, 'Error updating a record in the DB (2):', e)
          next()
        })
      }
    } else {
      res.error(404, 'No such record.', 10)
      next()
    }
    return Promise.resolve()
  }).catch(e => {
    g.log.w(1, 'Error updating a record in the DB (1):', e)
    res.status(400)
    next()
  })
}
