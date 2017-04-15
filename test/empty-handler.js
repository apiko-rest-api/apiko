'use strict'
let rp = require('request-promise')
let expect = require('chai').expect

describe('requests with no handler', () => {
  let apiko
  let apikoOpts
  beforeEach(async () => {
    const config = { port: 5000, verbosity: 0 }
    apiko = await require('../').run(config)
    apikoOpts = require('../apiko.json')
  })

  afterEach(() => {
    apiko.httpClose()
  })
  it('Empty DELETE /users handler for lvl handler should return 501', async () => {
    const response = await rp(
      {
        method: 'DELETE',
        uri: 'http://127.0.0.1:5000/users/',
        body: {
          secret: apikoOpts.secret
        },
        resolveWithFullResponse: true,
        json: true,
        simple: false
      })
    expect(response.statusCode).to.equal(501)
  })
})
