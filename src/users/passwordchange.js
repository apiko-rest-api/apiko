'use strict'
const bcrypt = require('bcryptjs')
const { NoUserWithIdError, IncorrectCurrentPasswordError, NoAdminUserWithId } = require('../errors')

async function findUser (req) {
  let user = await req.apiko.store.users.findById(parseInt(req.all.id))
  if (!user) {
    throw new NoUserWithIdError()
  }
  return user
}

async function findAdmin (apiko, id) {
  let user = await apiko.store.users.findById(parseInt(id))
  if (!user) {
    throw new NoAdminUserWithId()
  }
  return user
}

async function comparePassword (user, password) {
  const res = await bcrypt.compare(password, user.password)
  if (!res) {
    throw new IncorrectCurrentPasswordError()
  }
}

async function changePasswordAsync (req, res, next) {
  try {
    const user = await findUser(req)
    let isAdmin = false
    if (req.session.user) {
      isAdmin = req.session.user.role.split(',').includes('admin')
    }

    if (isAdmin) {
      const adminUser = await findAdmin(req.apiko, req.session.user.id)
      await comparePassword(adminUser, req.all.current)
    } else if (req.all.hasOwnProperty('secret') && req.all.secret === req.apiko.manager.setup.secret) {
      // We have the super secret!
    } else {
      await comparePassword(user, req.all.current)
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
    if (e instanceof IncorrectCurrentPasswordError || e instanceof NoUserWithIdError || e instanceof NoAdminUserWithId) {
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
