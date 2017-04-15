'use strict'
const { createUser, truncateUsers, loginOpts, postOptions } = require('./support/helpers')
let rp = require('request-promise')
let expect = require('chai').expect
const bcrypt = require('bcryptjs')

describe('users', () => {
  describe('req.passwordchange', () => {
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
    it('should return 200 OK', async () => {
      let user = await createUser(apiko)
      const response = await rp(postOptions('http://127.0.0.1:5000/users/password/change/' + user.id, { secret: apikoOpts.secret }))
      await truncateUsers(apiko)

      expect(response.statusCode).to.equal(200)
    })

    it('password hash should be changed', async () => {
      let user = await createUser(apiko)
      await rp(postOptions('http://127.0.0.1:5000/users/password/change/' + user.id, { secret: apikoOpts.secret }))
      await user.reload()
      const res = await bcrypt.compare('NewTestPassword1', user.password)
      await truncateUsers(apiko)

      expect(res).to.be.true
    })

    it('non existing user should sent 404', async () => {
      await createUser(apiko)
      const response = await rp(postOptions('http://127.0.0.1:5000/users/password/change/9999999', { secret: apikoOpts.secret }))
      await truncateUsers(apiko)

      expect(response.statusCode).to.equal(404)
    })

    it('incorrect old password should sent 401', async () => {
      const user = await createUser(apiko, { role: 'user' })

      let response = await rp(loginOpts({ username: user.username }))
      expect(response.statusCode).to.equal(200)

      let postOpts = postOptions('http://127.0.0.1:5000/users/password/change/' + user.id, { old: 'IncorrectPassword', token: response.body.token })
      response = await rp(postOpts)
      await truncateUsers(apiko)

      expect(response.statusCode).to.equal(401)
    })

    it('change with token, no secret', async () => {
      const user = await createUser(apiko, { username: 'testuser@apiko.org', password: 'TestPassword1', role: 'moderator' })

      let response = await rp(loginOpts({ username: user.username, password: 'TestPassword1' }))
      expect(response.statusCode).to.equal(200)
      let postOpts = postOptions('http://127.0.0.1:5000/users/password/change/' + user.id, { token: response.body.token })
      response = await rp(postOpts)
      await truncateUsers(apiko)

      expect(response.statusCode).to.equal(200)
    })
  })
})
