'use strict'
const bcrypt = require('bcryptjs')
const { NoUserWithIdError, IncorrectOldPasswordError } = require('../errors')

async function findUser (req) {
  let user = await req.apiko.store.users.findById(parseInt(req.all.id))
  if (!user) {
    throw new NoUserWithIdError()
  }
  return user
}

async function comparePassword (user, password) {
  const res = await bcrypt.compare(password, user.password)
  if (!res) {
    throw new IncorrectOldPasswordError()
  }
}

async function changePasswordAsync (req, res, next) {
  try {
    const user = await findUser(req)
    let isAdmin = false
    if (req.session.user) {
      isAdmin = req.session.user.role.split(',').includes('admin')
    }
    if (!(isAdmin || req.all.secret === req.apiko.manager.setup.secret)) {
      await comparePassword(user, req.all.old)
    }

    const newHash = req.apiko.app.hashPassword(req.all.new)

    await user.update({ password: newHash })

    if (req.session.user) {
      let plainUser = JSON.parse(JSON.stringify(user))
      delete plainUser.password
      req.session.user = plainUser
    }
    res.status(200)
    next()
  } catch (e) {
    if (e instanceof IncorrectOldPasswordError || e instanceof NoUserWithIdError) {
      res.body = res.setError(e.statusCode, e.message, e.errorCode)
      next()
    } else {
      req.apiko.log(1, 'Error in handler /users/passwordChange: ' + e.message)
      res.error(500, 'Sorry. We have catch an error during your request')
      next()
    }
  }
}

module.exports = function (req, res, next) {
  return changePasswordAsync(req, res, next)
}
