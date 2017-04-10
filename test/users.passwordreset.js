'use strict'
const { createUser, truncateUsers, loginOpts, postOptions} = require('./support/helpers')
let rp = require('request-promise')
let expect = require('chai').expect
const bcrypt = require('bcryptjs')

describe('users', () => {
  describe('req.passwordreset with secret', () => {
    let apiko
    let apikoOpts
    beforeEach(async () => {
      const config = { port: 5000, verbosity: 0 }
      apiko = await require('../').run(config)
      apikoOpts = require('../apiko.json')
      // await apiko.reload()
    })

    afterEach(() => {
      apiko.httpClose()
    })
    it('should return 200 OK', async () => {
        let user = await createUser(apiko)
        const response = await rp(postOptions('http://127.0.0.1:5000/users/password/reset/' + user.id, { secret: apikoOpts.secret }))
        await truncateUsers(apiko)

        expect(response.statusCode).to.equal(200)
    })

    it('password hash should be changed', async () => {
        let user = await createUser(apiko)
        const response = await rp(postOptions('http://127.0.0.1:5000/users/password/reset/' + user.id, { secret: apikoOpts.secret }))
        await user.reload()
        const res = await bcrypt.compare(response.body.new, user.password)
        await truncateUsers(apiko)

        expect(res).to.be.true
    })

    it('non existing user should sent 404', async () => {
        await createUser(apiko)
        const response = await rp(postOptions('http://127.0.0.1:5000/users/password/reset/9999999', { secret: apikoOpts.secret }))
        await truncateUsers(apiko)

        expect(response.statusCode).to.equal(404)
    })
  })

  describe('req.passwordreset with token', () => {
    let apiko
    let apikoOpts
    beforeEach(async () => {
      const config = { port: 5000, verbosity: 0 }
      apiko = await require('../').run(config)
      apikoOpts = require('../apiko.json')
      // await apiko.reload()
    })

    afterEach(() => {
      apiko.httpClose()
    })
    it('should return 200 OK', async () => {
      let user = await createUser(apiko)
      let response = await rp(loginOpts())
      expect(response.statusCode).to.equal(200)

      response = await rp(postOptions('http://127.0.0.1:5000/users/password/reset/' + user.id, { token: response.body.token}))
      await truncateUsers(apiko)

      expect(response.statusCode).to.equal(200)
    })

    it('password hash should be changed', async () => {
      let user = await createUser(apiko)
      let response = await rp(loginOpts())
      expect(response.statusCode).to.equal(200)

      response = await rp(postOptions('http://127.0.0.1:5000/users/password/reset/' + user.id, { token: response.body.token}))
      await user.reload()
      const res = await bcrypt.compare(response.body.new, user.password)
      await truncateUsers(apiko)

      expect(res).to.be.true
    })

    it('non existing user should sent 404', async () => {
      await createUser(apiko)
      let response = await rp(loginOpts())
      expect(response.statusCode).to.equal(200)

      response = await rp(postOptions('http://127.0.0.1:5000/users/password/reset/9999999', { token: response.body.token}))
      await truncateUsers(apiko)

      expect(response.statusCode).to.equal(404)
    })
  })
})
