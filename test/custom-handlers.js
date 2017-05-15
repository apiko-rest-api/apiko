'use strict'
const deepmerge = require('deepmerge')
const { createUser, truncateUsers, loginOpts } = require('./support/helpers')
let rp = require('request-promise')
let expect = require('chai').expect

describe('automatic end request if not ended', () => {
  let apiko
  beforeEach(async () => {
    const config = { port: 5000, verbosity: 0 }
    let Apiko = require('../')
    const customHandler = (req, res, next) => {
      let body = {}
      if (res.body) {
        body = deepmerge.all([body, JSON.parse(res.body)])
      }
      body.isAfterCoreHandler = body.hasOwnProperty('token')
      body.additional = true
      res.body = JSON.stringify(body)
      next()
    }
    Apiko.on('POST /users/login', customHandler)
    apiko = await Apiko.run(config)
  })

  afterEach(() => {
    apiko.httpClose()
    apiko = null
  })

  it('Should extend req.body with additional = true', async () => {
    const user = await createUser(apiko, { role: 'user' })

    let response = await rp(loginOpts({ username: user.username }))

    await truncateUsers(apiko)

    expect(response.body.additional).to.be.true
  })
  it('Should extend after core handler', async () => {
    const user = await createUser(apiko, { role: 'user' })

    let response = await rp(loginOpts({ username: user.username }))

    await truncateUsers(apiko)

    expect(response.body.isAfterCoreHandler).to.be.true
  })
})
