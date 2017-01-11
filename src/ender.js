module.exports = {
  ends: {
    'GET /users/login': {
      extendable: true,
      params: {
        username: {
          required: true,
          regex: '^\\S+\\@\\S+\\.\S+$'
        },
        password: {
          required: true,
          regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'
        }
      },
      handlers: {
        core: require('./users/login')
      },
      collection: 'users'
    },
    'GET /users': {
      extendable: true,
      params: {
        username: {
          required: true,
          regex: '^\\S+\\@\\S+\\.\S+$',
          type: 'STRING 100'
        },
        password: {
          required: true,
          regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$',
          type: 'STRING 100'
        }
      }
    },
    'PUT /apiko/setup': {
      extendable: false,
      handlers: {
        core: require('./setup/put')
      }
    },
    'GET /apiko/setup': {
      extendable: false,
      handlers: {
        core: require('./setup/get')
      },
      reservedCustomErrorCodes: [1]
    }
  },

  reload () {
    g.log(2, 'Reloading API endpoints...')

    //g.log.d(g.exApp._router.stack)

    // first, register all built-in handlers in Express
    for (let i in this.ends) {
      if (this.ends[i].handlers) {
        if (this.ends[i].handlers.core) {
          this.addHandling(i, 'core')
        } else {
          g.log.w(0, 'A built-in endpoint handler for', i, 'seems to be missing. This is an internal error, it may affect core functionality.')
        }
      } else {
        g.log.w(0, 'A built-in endpoint handler for', i, 'seems to be missing. This is an internal error, it may affect core functionality.')
      }
    }
    
    g.log(2, 'Endpoints set up.')
  },

  addHandling (end, handlerType) {
    route = end.split(' ')
    var method = route[0].toLowerCase()
    route = g.config.prefixed(route[1])

    g.log(3, 'Registering a handler for:', end)

    g.exApp[method](route, function (req, res, next) {
      var end = g.ender.ends[end]

      console.log(req.query)

      req = extendWithApi(req, res, end, handlerType)

      // check args
      if (end.params) {
        for (let i in end.params) {
          if (end.params[i].required && (req.query[i] === undefined)) {
            g.log.w(3, 'Someone tried to request ', g.ender.ends.indexOf(end), ' with the required parameter "', i,'" missing.')
            req.respondError(400, "The required parameter '" + i + "' is missing in the request.")
          }

          if ((req.query[i] !== undefined) && (end.params[i].regex)) {
            if (!(new Regex(end.params[i].regex)).test(req.query[i])) {
              g.log.w(3, 'Someone tried to request ', g.ender.ends.indexOf(end), ' with the parameter "', i,'" having an invalid value.')
              req.respondError(400, "The parameter '" + i + "' seems to have an invalid value.")
            }
          }
        }
      }
      
      if (end.handlers.core) { // If this end is extendable (and core) and has a core handler, execute the core handler. It will automatically execute the user handler afterwards if it has any if this endpoint is extendable.
        end.handlers.core(req, g.data.store)
      } else if (end.handlers.user) { // If this end contains only a user handler, execute it.
        end.handlers.user(req, g.data.store)
      } else { // if no handler is present, respond with an error.
        g.log.w(1, 'Someone tried to request ', g.ender.ends.indexOf(end), ' but there is no handler defined for this endpoint.')
        req.respondError(501)
      }
    })
  },

  on (end, callback, params) {
    var endpoint = this.ends[end]

    if (endpoint) {

      if (!endpoint.handlers) {
        g.log(2, 'Extending an existing custom (UI defined) endpoint:', end)
        endpoint.handlers.user = callback
      } else {
        if (end.extendable) {
          g.log(2, 'Extending an existing core endpoint:', end)
          endpoint.handlers.user = callback
        } else {
          g.log.e(1, 'You are trying to extend a core endpoint that is not extendable:', end)
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

      this.ends[end] = {
        params: params,
        handlers: {
          user: callback
        }
      }
    }

    this.addHandling(end, 'user')
  }
}

function extendWithApi (req, res, end, type) {
  req.endpoint = g.ender.ends[end]

  req.respondSuccess = function(data) {
    if (g.ender.ends[end].extendable && (type == 'core')) {
      this.response = {
        status: 200,
        data: data
      }
    } else {
      res.status(200)
      res.send(data)
    }
  }

  req.respondError = function(httpCode, customMessage, customCode) {
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

      if (g.ender.ends[end].handlers.extendable && g.ender.ends[end].handlers.user && (type == 'core')) {
        req.response = {
          status: httpCode,
          data: body
        }
      } else {
        res.send(body)
      }
    } else {
      if (g.ender.ends[end].handlers.extendable && g.ender.ends[end].handlers.user && (type == 'core')) {
        req.response = {status: httpCode}
        g.ender.ends[end].handlers.user(req)
      } else {
        res.send()
      }
    }
  }

  return req
} 