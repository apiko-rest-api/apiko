'use strict'
const deepmerge = require('deepmerge')
const Sequelize = require('sequelize')

module.exports = function (g) {
  return {
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
      let promises = []

    // very core collections (not even public)
      let statsP = this.addCollection('stats', {
        endpoint: { type: 'STRING 255' },
        ip: { type: 'STRING 45' },
        uid: { type: 'INTEGER' }
      })

      statsP.then(() => {
        g.log(3, 'Structure of stats synchronized.')
        return Promise.resolve()
      }).catch(error => {
        g.log.w(2, 'Structure sync error (stats):', error)
      })

      promises.push(statsP)

    // merge user and core collections into one object, override user collections with core collections
      this.collections = deepmerge.all([
        JSON.parse(JSON.stringify(g.manager.setup.collections)), JSON.parse(JSON.stringify(g.core.collections))
      ])

    // create models for the merged collections

      let publicP
      for (let i in this.collections) {
        publicP = this.addCollection(i, this.collections[i])

        publicP.then(() => {
          g.log(2, 'Structure of', i, 'synchronized.')
          return Promise.resolve()
        }).catch(error => {
          g.log.w(1, 'Structure sync error (', i, '):', error)
        })

        promises.push(publicP)
      }

      return Promise.all(promises)
    },

    addCollection (name, fields) {
      for (let i in fields) {
        if (fields[i].type.indexOf(' ') >= 0) {
          let parts = fields[i].type.split(' ')
          fields[i].type = Sequelize[parts[0]](parts[1])
        } else {
          fields[i].type = Sequelize[fields[i].type]
        }
      }

      if (fields.hasOwnProperty('id')) {
        g.log.w(2, `'id' property will be overridden for collection '${name}'`)
        delete fields['id']
      }

      if (fields.hasOwnProperty('owner')) {
        g.log.w(2, `'owner' property will be overridden for collection '${name}'`)
        delete fields['owner']
      }

      fields.owner = {
        type: Sequelize['INTEGER'],
        defaultValue: 0
      }

      let collection = this.store.define(name, fields, {
        freezeTableName: true // Model tableName will be the same as the model name
      })

      return collection.sync({ force: false, alter: process.env.NODE_ENV !== 'prod' }) // force: true drops & recreates tables every run
    },

    logRequest (req, res, next) {
      g.log(3, 'Logging a request...')

      let uid = 0

      if (req.session) {
        if (req.session.user) {
          uid = req.session.user.id
        }
      }

      g.data.store.models.stats.create({
        endpoint: g.ender.endFromReq(req),
        ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress),
        uid: uid
      })
      next()
    }
  }
}
