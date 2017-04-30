'use strict'
let rp = require('request-promise')
let expect = require('chai').expect

describe('automatic end request if not ended', () => {
  let apiko
  let apikoOpts
  beforeEach(async () => {
    const config = { port: 5000, verbosity: 0 }
    let Apiko = require('../')
    const customHandler = (req, res, next) => { next() }
    Apiko.on('GET /testroute', customHandler)
    const customEndedHandler = (req, res) => { res.sendStatus(202) }
    Apiko.on('GET /test-ended-route', customEndedHandler)
    apiko = await Apiko.run(config)
    apikoOpts = require('../apiko.json')
  })

  afterEach(() => {
    apiko.httpClose()
    apiko = null
  })
  it('Should end custom user request, that is not ended in handler', async () => {
    const response = await rp(
      {
        method: 'GET',
        uri: 'http://127.0.0.1:5000/testroute/',
        qs: {
          secret: apikoOpts.secret
        },
        resolveWithFullResponse: true,
        json: true,
        simple: false
      })
    expect(response.statusCode).to.equal(200)
  })

  it('Ended routes should return 202 HTTP code', async () => {
    const response = await rp(
      {
        method: 'GET',
        uri: 'http://127.0.0.1:5000/test-ended-route/',
        qs: {
          secret: apikoOpts.secret
        },
        resolveWithFullResponse: true,
        json: false,
        simple: false
      })
    expect(response.statusCode).to.equal(202)
  })

  it('Should return 404 on wrong route', async () => {
    const response = await rp(
      {
        method: 'GET',
        uri: 'http://127.0.0.1:5000/wrongroute/',
        qs: {
          secret: apikoOpts.secret
        },
        resolveWithFullResponse: true,
        json: true,
        simple: false
      })
    expect(response.statusCode).to.equal(404)
  })
})
