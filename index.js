"use strict"

module.exports = {
  config: {
    maintainBrowserTab: false,
    port: 5000,
    verbose: false,
    websockets: false,
    db: {
      storage: 'database.sqlite'
    }
  },

  on (route, callback) {
    console.log('Registered a callback.')
  },

  run (cfg) {
    console.log('Running')
  }
}