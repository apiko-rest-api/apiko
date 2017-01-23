module.exports = {
  collections: {
    'users': {
      id: {
        type: 'INTEGER'
      },
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
    'files': {
      id: {
        type: 'INTEGER',
        primaryKey: true
      },
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
    'GET /users/:id': {
      extendable: true,
      params: {
        id: {
          required: true,
          regex: '^\\d{1,10}$'
        }
      },
    },
    'POST /users': {
      extendable: true,
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
    'PUT /apiko/setup': {
      extendable: false,
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
      handlers: {
        core: './apiko/setup/get'
      },
      errors: {
        3: 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.'
      }
    },
    'GET /apiko/core': {
      extendable: false,
      handlers: {
        core: './apiko/core/get'
      },
      errors: {
        3: 'This server is protected by a secret that has to be supplied in the \'secret\' parameter.'
      }
    },
    'GET /files/:id': {
      extendable: true,
      params: {
        id: {
          required: true,
          regex: '^\\d{1,10}$'
        }
      }
    },
    'POST /files': {
      extendable: true
    }
  }
} 