"use strict"
global.g = global // sneaky hack to shorten global.something to g.something

const bcrypt = require('bcryptjs')
const http = require('http')
g.Sequelize = require('sequelize')
g.express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')

g.core = require('./src/core')
g.config = require('./src/config')
g.log = require('./src/log')
g.ender = require('./src/ender')
g.manager = require('./src/manager')
g.data = require('./src/data')

module.exports = {
  on (route, callback, params) {
    ender.on(route, callback)
  },

  httpListen () {
    g.server.listen(g.config.port, () => {
      g.log(1, 'Listening @', g.config.port)
    })
  },

  httpClose () {
    if (g.server.listening) {
      g.log(1, 'Closing HTTP server...')
      g.server.close()
    }
  },

  reload (setup) {
    g.manager.load(setup)
    g.data.sync()
    .then(() => {
      g.app.httpClose()
      g.ender.reload()
      g.app.httpListen()
    })
  },

  run (cfg) {
    g.app = this
    g.exApp = express()

    g.exApp.use(cors())
    g.exApp.use(bodyParser.json())
    g.exApp.use(bodyParser.urlencoded({ extended: true }))
    
    g.exApp.use('/dev', express.static(__dirname + path.sep + 'devui'))

    // if anybody wants to serve their web using Apiko instead of using a third party web server
    g.exApp.use('/', express.static('www'))
    g.server = http.createServer(g.exApp)

    g.config.merge(cfg)
    g.manager.init()
    g.data.init()
    
    // a shortcut, use as Apiko.store outside
    g.store = g.data.store.models

    this.reload()
  },
  
  hashPassword (password) {
    return bcrypt.hashSync(password, 8)
  }
}