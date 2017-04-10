const path = require('path')

module.exports = function(g){ 
  return {
    // Default configuration values
    maintainBrowserTab: false,
    port: 5000,
    verbosity: 1,
    prefix: '',
    protect: true,
    allowedOrigin: '*',
    ws: {
      open: false,
      port: 5001
    },
    db: {
      dialect: 'sqlite',
      host: 'localhost',
      user: 'root',
      pass: 'root',
      storage: 'datastore.sqlite'
    },
    filesDirectory: 'files',

    merge (cfg) {
      g.log(2, 'Merging configs...')

      if (cfg.hasOwnProperty('verbosity')) {
        if ((cfg.verbosity >= 0) && (cfg.verbosity <= 3)) {
          g.config.verbosity = cfg.verbosity
        } else {
          g.log.w(1, 'Configuration property verbosity is supposed to be a number 0 - 3. Going with default:', g.config.verbosity)
        }
      }

      if (cfg.prefix) {
        if (/^[a-zA-Z0-9]+$/g.test(cfg.prefix)) {
          g.config.prefix = cfg.prefix
        } else {
          g.log.w(1, 'The prefix configuration property should be a string containing only alphanumeric characters (should not contain /). Going with default:', g.config.cfg.prefix)
        }
      }

      if (cfg.protect === false) {
        g.config.protect = cfg.protect
      }

      if (cfg.port) {
        if (parseInt(cfg.port)) {
          g.config.port = cfg.port
        } else {
          g.log.w(1, 'Configuration property port should be a number. Going with default:', g.config.port)
        }
      }

      if (cfg.maintainBrowserTab) {
      }

      if (cfg.db) {
        var dbs = ['sqlite', 'mysql', 'mariadb', 'postgres', 'mssql']

        if (cfg.db.dialect) {
          if (dbs.indexOf(cfg.db.dialect) >= 0) {
            if (!cfg.db.user) {
              g.log.w(2, 'Configuration property db.user is not set. Going with default:', g.config.db.user)
            } else {
              g.config.db.user = cfg.db.user
            }

            if (!cfg.db.pass) {
              g.log.w(2, 'Configuration property db.pass is not set. Going with default:', g.config.db.pass)
            } else {
              g.config.db.pass = cfg.db.pass
            }

            if (cfg.db.dialect == 'sqlite') {
              if (cfg.db.storage) {
                if (path.isAbsolute(cfg.db.storage)) {
                  g.config.db.storage = cfg.db.storage
                } else {
                  g.config.db.storage = process.cwd() + path.sep + cfg.db.storage
                }
              } else {
                g.config.db.storage = process.cwd() + path.sep + g.config.db.storage
                g.log(2, 'SQLite storage file is not set (db.storage configuration property). Going with default:', g.config.db.storage)
              }
            }

            if (dbs.splice(0, 1).indexOf(cfg.db.dialect)) { // rest of the dbs except sqlite
              if (!cfg.db.host) {
                g.log.w(2, 'Configuration property db.host is not set. Going with default:', g.config.db.host)
              } else {
                g.config.db.host = cfg.db.host
              }
            }

            if (!cfg.db.name) {
              g.log.e(0, 'Configuration property db.name is missing. It should be the database name to open on your database server.')
              process.exit(1)
            } else {
              g.config.db.name = cfg.db.name
            }

            g.config.db.dialect = cfg.db.dialect
          } else {
            log.e(1, 'Configuration property db.dialect must have one of these values:', dbs)
            process.exit(1)
          }
        } else {
          g.log.e(1, 'Configuration property db.dialect must be present if you are specifying db.', 'It can be one of:', dbs)
          process.exit(1)
        }
      }

      if (cfg.ws) {
        if (cfg.ws.open) {
          g.config.ws.open = true

          if (cfg.ws.port) {
            if (parseInt(cfg.ws.port)) {
              if (cfg.ws.port != g.config.port) {
                g.config.ws.port = cfg.ws.port
              } else {
                g.log.e(1, 'Configuration property ws.port can\'t have the same value as configuration property port. Going with default:', g.config.ws.port)
              }
            } else {
              g.log.w(1, 'Configuration property ws.port should be a number. Going with default:', g.config.ws.port)
            }
          } else {
            g.log(2, 'Just FYI: Configuration property ws.port can be set but it is not. Going with default:', g.config.ws.port)
          }
        } else {
          g.log(1, 'If you are trying to setup web sockets, configuration property ws.open should be true.')
        }
      }

      if (cfg.filesDirectory) {
        if (/^[a-zA-Z0-9]+$/g.test(cfg.filesDirectory)) {
          g.config.filesDirectory = cfg.filesDirectory
        } else {
          g.log.w(1, 'The filesDirectory configuration property should be a string containing only alphanumeric characters (should not contain /). Going with default:', g.config.cfg.filesDirectory)
        }
      }
    },

    prefixed (url) {
      if (this.prefix) {
        return '/' + g.config.prefix + url
      }

      return url
    }
  }
}