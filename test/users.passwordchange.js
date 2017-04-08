'use strict'
let Apiko = require('../')
const { createUser, truncateUsers} = require('./support/helpers')
let rp = require('request-promise')
const apikoOpts = require('../apiko.json')
let expect = require('chai').expect
const bcrypt = require('bcryptjs')

let apiko = {}
const config = { port: 5000, verbosity: 0 }

const postOptions = (uri, body) => {
  let opts = {
    method: 'POST',
    uri: uri,
    body: {
      old: 'TestPassword1' || body.old,
      new: 'NewTestPassword1'|| body.new,
      secret: apikoOpts.secret || body.secret
    },
    resolveWithFullResponse: true,
    json: true,
    simple: false
  }
  if (body.token) {
    opts.body.token = body.token
  }
  return opts
}

before(async () => {
  apiko = await Apiko.run(config)
})

beforeEach(async () => {
  await apiko.reload()
})

describe('users', () => {
  describe('req.passwordchange', () => {
    it('should return 200 OK', async () => {
      let user = await createUser(apiko)
      const response = await rp(postOptions('http://127.0.0.1:5000/users/password/change/' + user.id))
      await truncateUsers(apiko)

      expect(response.statusCode).to.equal(200)
    })

    it('password hash should be changed', async () => {
      let user = await createUser(apiko)
      await rp(postOptions('http://127.0.0.1:5000/users/password/change/' + user.id))
      await user.reload()
      const res = await bcrypt.compare('NewTestPassword1', user.password)
      await truncateUsers(apiko)

      expect(res).to.be.true
    })

    it('non existing user should sent 404', async () => {
        await createUser(apiko)
        const response = await rp(postOptions('http://127.0.0.1:5000/users/password/change/9999999'))
        await truncateUsers(apiko)

        expect(response.statusCode).to.equal(404)
    })

    it('incorrect old password should sent 401', async () => {
      const user = await createUser(apiko)
      const response = await rp(postOptions('http://127.0.0.1:5000/users/password/change/' + user.id, { old: 'IncorrectPassword' }))
      await truncateUsers(apiko)

      expect(response.statusCode).to.equal(401)
    })

    it('change with token, no secret', async () => {
      const user = await createUser(apiko, 'testuser@apiko.org', 'TestPassword1', 'moderator')

      const loginOpts = {
        method: 'POST',
        uri: 'http://127.0.0.1:5000/users/login',
        body: {
          username: 'testuser@apiko.org',
          password: 'TestPassword1'
        },
        resolveWithFullResponse: true,
        json: true,
        simple: false
      }

      let response = await rp(loginOpts)
      expect(response.statusCode).to.equal(200)
      let postOpts = postOptions('http://127.0.0.1:5000/users/password/change/' + user.id, { token: response.body.token})
      delete postOpts.body.secret
      response = await rp(postOpts)
      await  truncateUsers(apiko)

      expect(response.statusCode).to.equal(500)
    })
  })
})
