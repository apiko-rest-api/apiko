'use strict'
const deepmerge = require('deepmerge')
const path = require('path')

module.exports = function (g) {
  return {
    endpoints: g.core.endpoints,

    reload () {
      g.log(2, 'Reloading API endpoints...')

      // merge generic, core and user endpoints, override: generic <- core <- user
      this.endpoints = deepmerge.all([this.genericCollectionEndpoints(), g.core.endpoints, g.manager.setup.endpoints])

      // register all endpoint handlers
      let route
      for (let i in this.endpoints) {
        route = i.split(' ')
        let method = route[0].toLowerCase()
        route = g.config.prefixed(route[1])

        // extend handler arguments with Apiko specific API
        g.exApp[method](route, g.ender.extendWithApi)

        // load a different session if specified in ?token=
        g.exApp[method](route, g.ender.loadSession)

        // stats logging
        g.exApp[method](route, g.data.logRequest)

        // check whether if the client complies with the endpoint restriction
        g.exApp[method](route, g.ender.checkRestrictions)

        // check whether the predefined params are valid
        g.exApp[method](route, g.ender.checkAllPredefined)

        if (this.endpoints[i].handlers) {
          if (this.endpoints[i].handlers.core || this.endpoints[i].handlers.user) {
            if (this.endpoints[i].handlers.core) {
              if (typeof this.endpoints[i].handlers.core === 'string') {
                this.addHandling(i, require(this.endpoints[i].handlers.core))
              } else {
                this.addHandling(i, this.endpoints[i].handlers.core)
              }
            }

            if (this.endpoints[i].handlers.user) {
              if (typeof this.endpoints[i].handlers.user === 'string') {
                this.addHandling(i, require(process.cwd() + path.sep + this.endpoints[i].handlers.user))
              } else {
                this.addHandling(i, this.endpoints[i].handlers.user)
              }
            }
          } else {
            g.log.w(2, 'Endpoint ', i, 'is registered with no handler! (2)')
            this.addHandling(i, require('./empty-handler'))
          }
        } else {
          g.log.w(2, 'Endpoint ', i, 'is registered with no handler! (1)')
          this.addHandling(i, require('./empty-handler'))
        }
      }

      g.log(2, 'Adding custom endpoint handlers...')

      for (let i in g.app.customEnds) {
        if (g.app.customEnds[i].params) {
          g.ender.on(g.app.customEnds[i].route, g.app.customEnds[i].handler, g.app.customEnds[i].params)
        } else {
          g.ender.on(g.app.customEnds[i].route, g.app.customEnds[i].handler)
        }
        this.addHandling(g.app.customEnds[i].route, g.ender.endIfNotEnded)
      }

      g.log(2, 'Adding end to all endpoints')
      for (let i in this.endpoints) {
        route = i.split(' ')
        let method = route[0].toLowerCase()
        route = g.config.prefixed(route[1])
        // a checker that eventually sends the response if nothing else in the chain does
        g.exApp[method](route, g.ender.endIfNotEnded)
      }

      g.log(2, 'Core and generic endpoints set up.')
    },

    automaticEndResponse () {
      // merge generic, core and user endpoints, override: generic <- core <- user
      this.endpoints = deepmerge.all([this.genericCollectionEndpoints(), g.core.endpoints, g.manager.setup.endpoints])

      // register all endpoint handlers
      let route
      for (let i in this.endpoints) {
        route = i.split(' ')
        let method = route[0].toLowerCase()
        route = g.config.prefixed(route[1])
        // a checker that eventually sends the response if nothing else in the chain does
        g.exApp[method](route, g.ender.endIfNotEnded)
      }
    },

    addHandling (end, handler) {
      let route = end.split(' ')
      let method = route[0].toLowerCase()
      let unprefixedRoute = route[1]
      route = g.config.prefixed(route[1])

      g.log(2, 'Registering a handler for:', method.toUpperCase(), unprefixedRoute)

      g.exApp[method](route, handler)
    },

    on (end, handler, params) {
      if (this.endpoints[end]) {
        if (!this.endpoints[end].handlers) {
          g.log(2, 'Extending an existing custom (UI defined) endpoint:', end)

          this.endpoints[end].handlers = {
            user: handler
          }
        } else {
          if (this.endpoints[end].extendable) {
            g.log(2, 'Extending an existing core or generic endpoint:', end)
            this.endpoints[end].handlers.user = handler
          } else {
            g.log.e(1, 'You are trying to extend a core endpoint that should not be extended (may affect core functionality):', end)
          }
        }
      } else {
        g.log(2, 'Creating a new endpoint:', end)

        if (params) {
          for (let i in params) {
            if (!params[i].regex) {
              g.log.w(2, 'The "', i, '" parameter that you have specified in your code (not UI) for the endpoint', end, 'seems to be missing the regex option. It is a good idea to validate all parameters. For a number with exactly 4 digits e.g.: { mynumberparam: { required: true, regex: \'^\\d{4}$\' }} or for a normal string with spaces up to 255 characters: { mystringparam: { required: false, regex: \'^[\\w ]{1,255}$\' }}')
            }
          }
        }

        this.endpoints[end] = {
          params: params,
          handlers: {
            user: handler
          }
        }
      }

      this.addHandling(end, handler)
    },

    genericCollectionEndpoints () {
      let genericEndpoints = {}
      let postParams
      // let putParams

      for (let i in g.data.collections) {
        // GET for every collection
        genericEndpoints['GET /' + i] = {
          extendable: true,
          params: {
            limit: { regex: '^\\d+$' },
            offset: { regex: '^\\d+$' },
            order: { regex: '^[\\S ]+$' },
            group: { regex: '^[\\S ]+$' }
          },
          handlers: {
            core: './generic/get'
          },
          errors: {
            6: 'Undefined collection.'
          }
        }

        postParams = {}
        for (let column in g.data.collections[i]) {
          let columnParams = g.data.collections[i][column]

          if ((column === 'id') || (column === 'owner')) {
            postParams[column] = { required: false }
          } else {
            if (columnParams.hasOwnProperty('required')) {
              postParams[column] = { required: columnParams.required }
            } else {
              postParams[column] = { required: true }
            }
          }
        }

        // POST (create) for every collection
        genericEndpoints['POST /' + i] = {
          extendable: true,
          params: postParams,
          handlers: {
            core: './generic/post'
          },
          errors: {
            6: 'Undefined collection.'
          }
        }

        // GET a single item by ID for every collection
        genericEndpoints['GET /' + i + '/:id'] = {
          extendable: true,
          params: {
            id: {
              required: true,
              regex: '^\\d{1,10}$'
            }
          },
          handlers: {
            core: './generic/getone'
          },
          errors: {
            6: 'Undefined collection.',
            9: 'No such record.'
          }
        }

        // PUT (overwrite) a single item by ID for every collection
        genericEndpoints['PUT /' + i + '/:id'] = {
          extendable: true,
          params: {
            id: {
              required: true,
              regex: '^\\d{1,10}$'
            }
          },
          handlers: {
            core: './generic/put'
          },
          errors: {
            6: 'Undefined collection.',
            9: 'No such record.'
          }
        }

        // DELETE a single item by ID for every collection
        genericEndpoints['DELETE /' + i + '/:id'] = {
          extendable: true,
          params: {
            id: {
              required: true,
              regex: '^\\d{1,10}$'
            }
          },
          handlers: {
            core: './generic/delete'
          },
          errors: {
            6: 'Undefined collection.',
            9: 'No such record.'
          }
        }
      }

      return genericEndpoints
    },

    checkAllPredefined (req, res, next) {
      g.log(2, 'Checking parameters...')

      if (req.endpoint.params) {
        for (let i in req.endpoint.params) {
          if (req.endpoint.params[i].required && ((req.all[i] === undefined) || (req.all[i] === ''))) {
            g.log.w(3, 'The', i, 'parameter is required, but undefined or empty.')
            if (!res.headersSent) {
              res.error(400, 'The ' + i + ' parameter is required, but undefined or empty.', 1)
            }
          }

          if (req.endpoint.params[i].regex && (req.all[i] !== undefined) && (req.all[i] !== '') && !res.headersSent) {
            let regex = new RegExp(req.endpoint.params[i].regex)
            if (!regex.test(req.all[i])) {
              g.log.w(3, 'The', i, "parameter is in an incorrect format (no regex match): '" + req.all[i] + "' Regex:", regex)
              if (!res.headersSent) {
                res.error(400, 'The ' + i + ' parameter is in an incorrect format (no regex match).', 2)
              }
            }
          }
        }
      }

      if (!res.headersSent) {
        g.log(2, 'This request has passed the params check.')
        next()
      } else {
        g.log(2, 'This request has not passed the params check.')
      }
    },

    extendWithApi (req, res, next) {
      let end = g.ender.endFromReq(req)
      g.log(2, 'Extending', end, 'with API...')

      req.endpoint = g.ender.endpoints[end]

      // merge all request properties in req.params and req.query or req.body, favor req.body to req.query and req.params to others
      req.all = deepmerge.all([req.query, req.body, req.params])

      res.success = function (data) {
        res.status(200)
        res.type('application/json')
        res.send(data)
      }

      res.error = function (httpCode, customMessage, customCode) {
        if (!httpCode) {
          httpCode = 400
        }

        res.status(httpCode)
        res.type('application/json')

        if (customMessage || customCode) {
          let body = {}

          if (customCode) {
            body.code = customCode
          }

          if (customMessage) {
            body.message = customMessage
          }

          res.send(body)
        } else {
          res.send()
        }
      }

      res.setError = function (httpCode, customMessage, customCode) {
        if (!httpCode) {
          httpCode = 400
        }

        res.status(httpCode)
        res.type('application/json')

        let body = {}
        if (customMessage || customCode) {
          if (customCode) {
            body.code = customCode
          }

          if (customMessage) {
            body.message = customMessage
          }
        }

        return body
      }

      next()
    },

    loadSession (req, res, next) {
      g.log(2, 'Checking if a different session token is specified...')

      if (req.all.token) {
        g.log(2, 'A different session token is specified. Loading session...')

        req.sessionStore.get(req.all.token, (err, session) => {
          if (session) {
            // createSession() re-assigns req.session
            req.sessionStore.createSession(req, session)
            g.log(2, 'Session', req.all.token, 'loaded.')
          } else {
            g.log.w(1, 'Could not load the specified session.', err)
          }

          return next()
        })
      } else {
        g.log(2, 'No session token is specified, going with', req.sessionID)
        next()
      }
    },

    checkRestrictions (req, res, next) {
      g.log(2, 'Checking restrictions...')

      if (req.all.secret === g.manager.setup.secret) {
        g.log(2, 'Access with secret admin key')
        next()
        return
      }

      let end = g.ender.endFromReq(req)
      let endpoint = g.ender.endpoints[end]

      if (endpoint.restrict) {
        if (!req.session.user) {
          g.log.w(1, 'This endpoint requires login.')
          res.error(401, 'This endpoint requires login.', 8)
        }

        if (endpoint.restrict === true) {
          req.checkOwnership = endpoint.ownership
        } else {
          let userRoles = req.session.user.role.split(',')

          let hasOne = false
          for (let i in userRoles) {
            if (userRoles.hasOwnProperty(i)) {
              let role = userRoles[i]
              if (endpoint.restrict.indexOf(role) >= 0) {
                hasOne = true
                break
              }
            }
          }

          if (!hasOne) {
            if (endpoint.ownership === true) {
              req.checkOwnership = true
            } else {
              g.log.w(1, "This user doesn't seem to have sufficient rights. One of either is required:", endpoint.restrict)
              res.error(403, "This user doesn't seem to have sufficient rights. One of either is required: " + endpoint.restrict, 9)
            }
          }
        }
      }

      if (!res.headersSent) {
        g.log(2, 'This request has passed the restrictions check.')
        next()
      }
    },

    endIfNotEnded (req, res) {
      if (!res.headersSent) {
        g.log(2, 'Automatically ending the response...')

        if (res.body) {
          res.send(res.body)
        } else {
          res.end()
        }
      }
    },

    endFromReq (req) {
      let end = (req.method.toUpperCase() + ' ' + req.route.path)

      if (g.config.prefix) {
        end = end.replace('/' + g.config.prefix, '')
      }

      return end
    }
  }
}
