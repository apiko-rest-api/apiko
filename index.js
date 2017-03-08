"use strict"
// global.g = global // sneaky hack to shorten global.something to g.something
let g = {};
const apiko = g;

const bcrypt = require('bcryptjs')
const http = require('http')
const express = apiko.express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)

g.core = require('./src/core')
g.config = require('./src/config')(g)
g.log = require('./src/log')(g)
g.ender = require('./src/ender')(g)
g.manager = require('./src/manager')(g)
g.data = require('./src/data')(g)

module.exports = {
  // access to core props and objects from outside (for user handlers)
  log: g.log,
  store: g.data.store,
  
  customEnds: [],
  
  on (route, handler, params) {
    this.customEnds.push({
      route: route,
      handler: handler,
      params: params
    })
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
    g.data.sync().then(() => {
      g.app.httpClose()
      g.ender.reload()
      g.app.loaded()
      g.app.httpListen()
    })
  },
  
  loaded () {
    g.log(2, 'Adding custom endpoint handlers...')
    
    for (let i in this.customEnds) {
      if (this.customEnds[i].params) {
        g.ender.on(this.customEnds[i].route, this.customEnds[i].handler, this.customEnds[i].params)
      } else {
        g.ender.on(this.customEnds[i].route, this.customEnds[i].handler)
      }
    }
  },

  run (cfg) {
    g.app = this
    g.exApp = express()

    g.exApp.use(function(req, res, next) {
      req.apiko = g;
      next();
    })
    g.exApp.use(cors())
    g.exApp.use(bodyParser.json())
    g.exApp.use(bodyParser.urlencoded({ extended: true }))
    
    g.exApp.use('/dev', express.static(__dirname + path.sep + 'devui'))
    
    // sessions
    g.exApp.use(session({
      store: new FileStore(),
      secret: 'apikosSecret',
      resave: true,
      saveUninitialized: false
    }))

    // if anybody wants to serve their web using Apiko instead of using a third party web server
    g.exApp.use('/', express.static('www'))
    g.server = http.createServer(g.exApp)

    g.config.merge(cfg)
    g.manager.init()
    g.data.init()
    
    // a shortcut, use as Apiko.store outside
    g.store = g.data.store.models

    this.reload()
    
    return this
  },
  
  hashPassword (password) {
    return bcrypt.hashSync(password, 8)
  }
}