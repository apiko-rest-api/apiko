module.exports = {
  endpoints: g.core.endpoints,

  reload () {
    g.log(2, 'Reloading API endpoints...')

    //g.log.d(g.exApp._router.stack)

    // first, register all built-in handlers in Express
    for (let i in this.endpoints) {
      route = i.split(' ')
      var method = route[0].toLowerCase()
      route = g.config.prefixed(route[1])
      
      // extend handler arguments with Apiko specific API
      g.exApp[method](route, g.ender.extendWithApi)

      // stats logging
      g.exApp[method](route, g.data.logRequest)

      // check whether the predefined params are valid
      g.exApp[method](route, g.ender.checkAllPredefined)
    
      if (this.endpoints[i].handlers) {
        if (this.endpoints[i].handlers.core) {
          this.addHandling(i, this.endpoints[i].handlers.core)
        } else {
          g.log.w(0, 'A built-in endpoint handler for', i, 'seems to be missing. This is an internal error, it may affect core functionality.')
        }
      } else {
        g.log.w(0, 'A built-in endpoint handler for', i, 'seems to be missing. This is an internal error, it may affect core functionality.')
      }
    }
    
    g.log(2, 'Endpoints set up.')
  },

  addHandling (end, handler) {
    route = end.split(' ')
    var method = route[0].toLowerCase()
    route = g.config.prefixed(route[1])

    g.log(2, 'Registering a handler for:', method.toUpperCase(), route)

    if (typeof handler == 'string') { // core handlers are paths
      handler = require(handler)
    }
    
    g.exApp[method](route, handler)
  },

  on (end, callback, params) {
    if (this.endpoints[end]) {
      if (!this.endpoints[end].handlers) {
        g.log(2, 'Extending an existing custom (UI defined) endpoint:', end)
        this.endpoints[end].handlers.user = callback
      } else {
        if (end.extendable) {
          g.log(2, 'Extending an existing core endpoint:', end)
          this.endpoints[end].handlers.user = callback
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
          user: callback
        }
      }
    }

    this.addHandling(end)
  },
  
  checkAllPredefined (req, res, next) {
    var problem = false
    
    if (req.endpoint.params) {
      for (let i in req.endpoint.params) {
        if (req.endpoint.params[i].required && ((req.all[i] === undefined) || (req.all[i] === '')) ) {
          res.error(400, "The " + i + " parameter is required, but undefined or empty.", 1)
          problem = true
        }
        
        if (req.endpoint.params[i].regex) {
          var regex = new RegExp(req.endpoint.params[i].regex)
          if (!regex.test(req.all[i])) {
            res.error(400, "The " + i + " parameter is in an incorrect format (no regex match).", 2)
            problem = true
          }
        }
      }
    }
    
    if (!problem) {
      next()
    }
  },
  
  extendWithApi (req, res, next) {
    var end = g.ender.endFromReq(req)
    g.log(2, 'Extending', end, 'with API...')
    
    req.endpoint = g.ender.endpoints[end]
    req.all = JSON.parse(JSON.stringify(req.query)) // { ...req.params, ...req.query, ...req,body }
    
    // merge all request properties in req.params and req.query or req.body, favor req.body to req.query and req.params to others
    for (var i in req.body) {
      req.all[i] = req.body[i]
    }
    
    for (var i in req.params) {
      req.all[i] = req.params[i]
    }

    res.success = function(data) {
      res.status(200)
      res.send(data)
    }

    res.error = function(httpCode, customMessage, customCode) {
      if (!httpCode) {
        httpCode = 400
      }

      res.status(httpCode)

      if (customMessage || customCode) {
        var body = {}

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

    res.setError = function(httpCode, customMessage, customCode) {
      if (!httpCode) {
        httpCode = 400
      }

      res.status(httpCode)

      var body = ''
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
  
  endFromReq (req) {
    var end = (req.method.toUpperCase() + ' ' + req.route.path)
    
    if (g.config.prefix) {
      end = end.replace('/' + g.config.prefix, '')
    }
    
    return end
  }
}