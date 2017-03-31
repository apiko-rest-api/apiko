const path = require('path')
const fs = require('fs')

module.exports = function(g){
  return {
  setup: null,
  file: '',

  init () {
    this.file = process.cwd() + path.sep + 'apiko.json'
  },

  load (content) {
    g.log(1, 'Loading API setup...')

    if (!content) {
      g.log(2, 'Looking for the API setup file...', this.file)

      if (fs.existsSync(this.file)) {
        g.log(2, 'Parsing API setup...')

        content = fs.readFileSync(process.cwd() + path.sep + 'apiko.json')
        content = JSON.parse(content)
      } else {
        g.log(2, 'The API setup file does not exist. Creating default API setup...')
        content = this.defaultSetup()
      }
    } else {
      g.log(2, 'Received an API setup from a string, so not loading setup from file.')
    }

    g.log(2, 'Checking this API setup...')

    if (this.check(content)) {
      g.log(2, 'This API setup seems to be OK.')
      this.setup = content

      g.log(2, 'Saving this API setup to file...', this.file)
      this.save()
    } else {
      g.log.e(1, 'This API setup seems to have some problems, see the messages above - verbosity level 2 is required, current level:', g.config.verbosity)
      process.exit(1)
    }
  },

  check (content) {
    if (!content.collections) {
      content.collections = {}
    }
    
    if (!content.endpoints) {
      content.endpoints = {}
    }

    for (let collection in content.collections) {
      for (let property in content.collections[collection]) {
        if (!content.collections[collection][property].type) {
          g.log.w(1, 'The property \'', property, '\' of collection \'', collection, '\' must have a type specified.')
          process.exit(1)
        }
      }
    }

    return content
  },

  save () {
    fs.writeFileSync(this.file, JSON.stringify(this.setup, null, 2))
  },

  defaultSetup () {
    return {
      secret: this.genSecret(),
      ends: {},
      collections: {}
    }
  },

  genSecret () {
    var allowed = 'abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    var secret = ''

    for (var n = 0; n < 30; n++) {
      secret += allowed[Math.floor(Math.random() * allowed.length)]
    }

    console.log('                                                            +--------------------------------+')
    g.log(1, 'Generated a new dev access secret: |', secret, '|')
    console.log('                                                            +--------------------------------+')

    return secret
  }
}
}