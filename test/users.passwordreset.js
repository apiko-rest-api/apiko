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
  return {
    method: 'POST',
    uri: uri,
    body: {
      secret: apikoOpts.secret || body.secret
    },
    resolveWithFullResponse: true,
    json: true,
    simple: false
  }
}

before(async () => {
  apiko = await Apiko.run(config)
})

beforeEach(async () => {
  await apiko.reload()
})

describe('users', () => {
  describe('req.passwordreset', () => {
    it('should return 200 OK', async () => {
        let user = await createUser(apiko)
        const response = await rp(postOptions('http://127.0.0.1:5000/users/password/reset/' + user.id))
        await truncateUsers(apiko)

        expect(response.statusCode).to.equal(200)
    })

    it('password hash should be changed', async () => {
        let user = await createUser(apiko)
        const response = await rp(postOptions('http://127.0.0.1:5000/users/password/reset/' + user.id))
        await user.reload()
        const res = await bcrypt.compare(response.body.new, user.password)
        await truncateUsers(apiko)

        expect(res).to.be.true
    })

    it('non existing user should sent 404', async () => {
        await createUser(apiko)
        const response = await rp(postOptions('http://127.0.0.1:5000/users/password/reset/9999999'))
        await truncateUsers(apiko)

        expect(response.statusCode).to.equal(404)
    })
  })
})
