const bcrypt = require('bcryptjs')
const deepmerge = require('deepmerge')
const Sequelize = require('sequelize')

module.exports = {
  store: null,
  collections: null,

  init () {
    g.log(2, 'Connecting database...')

    this.store = new Sequelize(g.config.db.name, g.config.db.user, g.config.db.pass, {
      host: g.config.db.host,
      dialect: g.config.db.dialect,
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      storage: g.config.db.storage,
      logging (msg) {
        g.log(3, msg)
      }
    })

    g.log(2, 'Database connected.')
  },

  sync () {
    g.log(2, 'Synchronizing database...')
    var promises = []

    // very core collections (not even public)
    var statsP = this.addCollection('stats', {
      id: { type: 'INTEGER' },
      endpoint: { type: 'STRING 255' },
      ip: { type: 'STRING 45' },
      uid: { type: 'INTEGER' }
    })

    statsP.then(() => {
      g.log(3, 'Structure of stats synchronized.')
    }).catch(error => {
      g.log.w(2, 'Structure sync error (stats):', error)
    })

    promises.push(statsP)
    
    // merge user and core collections into one object, override user collections with core collections
    this.collections = deepmerge.all([g.manager.setup.collections, g.core.collections])

    // create models for the merged collections

    var publicP
    for (let i in this.collections) {
      publicP = this.addCollection(i, this.collections[i])

      publicP.then(() => {
        g.log(2, 'Structure of', i,'synchronized.')
      }).catch(error => {
        g.log.w(1, 'Structure sync error (', i, '):', error)
      })

      promises.push(publicP)
    }

    return Promise.all(promises)
  },

  addCollection (name, fields) {
    var parts
    for (let i in fields) {
      if (fields[i].type.indexOf(' ') >= 0) {
        parts = fields[i].type.split(' ')
        fields[i].type = Sequelize[parts[0]](parts[1])
      } else {
        fields[i].type = Sequelize[fields[i].type]
      }

      if (i == 'id') {
        fields[i].primaryKey = true
        fields[i].autoIncrement = true
      }
    }

    var collection = this.store.define(name, fields, {
      freezeTableName: true // Model tableName will be the same as the model name
    })

    return collection.sync({ force: false }) // force: true drops & recreates tables every run
  },
  
  logRequest (req, res, next) {
    g.log(3, 'Logging a request...')
    
    g.data.store.models.stats.create({
      endpoint: g.ender.endFromReq(req), 
      ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress),
      uid: 0
    })
    next()
  },
  
  verifyPassword (username, password) {
    return new Promise((resolve, reject) => {
      g.data.store.models.users.findOne({ where: {username: username} }).then((user) => {
        if (bcrypt.compareSync(password, user.password)) {
          resolve()
        } else {
          reject()
        }
      }).catch(() => {
        reject()
      })
    })
  }
}