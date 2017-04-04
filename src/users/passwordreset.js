'use strict'
const deepmerge = require('deepmerge')
const { NoUserWithIdError } = require('../errors')

async function findUser (req) {
  let user = await req.apiko.store.users.findById(parseInt(req.all.id))
  if (!user) {
    throw new NoUserWithIdError()
  }
  return user
}

function genSecret () {
  let secret = ''
  let allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  secret += allowed[Math.floor(Math.random() * allowed.length)] // 1 Capital letter
  allowed = '~_@#$%&*='
  secret += allowed[Math.floor(Math.random() * allowed.length)] // 1 special character
  allowed = 'abcdefghijklmnopqrstuvxyz'
  for (let n = 0; n < 6; n++) {
    secret += allowed[Math.floor(Math.random() * allowed.length)] // 6 letters
  }
  allowed = '0123456789'
  for (let n = 0; n < 2; n++) {
    secret += allowed[Math.floor(Math.random() * allowed.length)] // 2 digits
  }

  return secret
}

async function resetPasswordAsync (req, res, next) {
  try {
    const user = await findUser(req)
    const newPassword = genSecret()
    const newHash = req.apiko.app.hashPassword(newPassword)

    await user.update({ password: newHash })

    if (req.session.user) {
      let plainUser = JSON.parse(JSON.stringify(user))
      delete plainUser.password
      req.session.user = plainUser
    }

    let body = res.body || {}
    res.body = deepmerge(body, { 'new': newPassword })

    res.status(200)
    next()
  } catch (e) {
    if (e instanceof NoUserWithIdError) {
      res.body = res.setError(e.statusCode, e.message, e.errorCode)
      next()
    } else {
      req.apiko.log(1, 'Error in handler /users/passwordReset: ' + e.message)
      res.error(500, 'Sorry. We have catch an error during your request')
      next()
    }
  }
}

module.exports = function (req, res, next) {
  (async () => {
    await resetPasswordAsync(req, res, next)
  })()
}
