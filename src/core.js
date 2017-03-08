module.exports = {
  collections: {
    users: {
      username: {
        type: 'STRING 100'
      },
      password: {
        type: 'STRING 60'
      },
      role: {
        type: 'STRING 255',
        comment: 'May contain a comma-separated list of roles, e.g.: \'moderator, admin\''
      }
    },
    files: {
      mime: {
        type: 'STRING 100'
      },
      path: {
        type: 'TEXT'
      }
    }
  },
  endpoints: {
    'POST /users/login': {
      extendable: true,
      comment: 'Attempts to log a user in (login).',
      params: {
        username: {
          required: true,
          regex: '^\\S+\\@\\S+\\.\\S+$'
        },
        password: {
          required: true,
          regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,18}$'
        }
      },
      handlers: {
        core: './users/login'
      },
      errors: {
        6: 'There is no user with this username.',
        7: 'Incorrect password.'
      }
    },
    'GET /users': {
      extendable: true,
      restrict: true,
      handlers: {
        core: './users/get',
      },
      comment: 'Returns a list of users.'
    },
    'GET /users/:id(\\d+)/': {
      extendable: true,
      restrict: true,
      handlers: {
        core: './users/getone',
      },
      comment: 'Returns information about a user with the specified ID.'
    },
    'DELETE /users': {
      extendable: true,
      comment: 'Removes a user.',
      restrict: 'admin'
    },
    'POST /users': {
      extendable: true,
      comment: 'Registers a new user.',
      params: {
        username: {
          required: true,
          regex: '^\\S+\\@\\S+\\.\\S+$'
        },
        password: {
          required: true,
          regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,18}$'
        },
        name: {
          required: true,
          regex: '^[\\s\\w\\.áäčďžéíĺľňóôŕřšťúýžÁÄČĎŽÉÍĹĽŇÓÔŔŘŠŤÚÝŽ]{2,40}$'
        }
      },
      handlers: {
        core: './users/post'
      },
      errors: {
        5: 'This username is already registered.'
      }
    },
    'GET /users/exists': {
      extendable: true,
      params: {
        username: {
          required: true,
          regex: '^\\S+\\@\\S+\\.\\S+$',
        },
      },
      handlers: {
        core: './users/exists',
      }
    },
    'PUT /apiko/setup': {
      extendable: false,
      comment: 'Updates the server\'s current setup.',
      handlers: {
        core: './apiko/setup/put'
      },
      errors: {
        3: 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.',
        4: 'The \'setup\' parameter containing the actual setup is mandatory.'
      }
    },
    'GET /apiko/setup': {
      extendable: false,
      comment: 'Retrieves the server\'s current setup.',
      handlers: {
        core: './apiko/setup/get'
      },
      errors: {
        3: 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.'
      }
    },
    'GET /apiko/core': {
      extendable: false,
      comment: 'Retrieves the server\'s core endpoints and collections.',
      handlers: {
        core: './apiko/core/get'
      },
      errors: {
        3: 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.'
      }
    },
    'GET /files': {
      extendable: true,
      comment: 'Retrieves a list of all files.'
    },
    'GET /files/:id': {
      extendable: true,
      comment: 'Downloads a file specified by ID.',
      params: {
        id: {
          required: true,
          regex: '^\\d{1,10}$'
        }
      }
    },
    'POST /files': {
      extendable: true,
      comment: 'Uploads a new file.'
    },
    'PUT /files/:id': {
      extendable: true,
      comment: 'Updates a file specified by ID.',
      params: {
        id: {
          required: true,
          regex: '^\\d{1,10}$'
        }
      }
    },
    'DELETE /files/:id': {
      extendable: true,
      comment: 'Removes a file specified by ID.',
      params: {
        id: {
          required: true,
          regex: '^\\d{1,10}$'
        }
      }
    },
    'GET /apiko/stats': {
      extendable: false,
      comment: 'Stats data with optional interval parameters. If no interval is set, data for the recent 30 days will be returned.',
      handlers: {
        core: './apiko/stats/get'
      },
      params: {
        start: {
          required: false,
          regex: '^\\d+$',
          comment: 'Time interval start for the requested stats as an UNIX timestamp.'
        },
        end: {
          required: false,
          regex: '^\\d+$',
          comment: 'Time interval end for the requested stats as an UNIX timestamp.'
        },
      }
    },
    'GET /apiko/reference': {
      extendable: false,
      comment: "Displays a generated API reference of this API server.",
      handlers: {
        core: './apiko/reference/get'
      },
      params: {
        secret: {
          required: false,
          comment: 'The server\' secret, required to display the reference if the server is set to protect with a secret.'
        },
        core: {
          required: false,
          comment: 'Will display the core endpoints as a part of the reference if a true-like value is supplied.'
        },
      },
      errors: {
        3: 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.'
      }
    },
  }
} 