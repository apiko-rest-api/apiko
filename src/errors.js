'use strict'
class NoUserWithIdError extends Error {
  constructor () {
    super()
    this.message = 'There is no user with such id.'
    this.name = 'NoUserWithIdError'
    this.errorCode = 10
    this.statusCode = 404
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoUserWithIdError)
    } else {
      this.stack = (new Error()).stack
    }
  }
}

class IncorrectCurrentPasswordError extends Error {
  constructor () {
    super()
    this.message = 'Incorrect current password.'
    this.name = 'IncorrectCurrentPasswordError'
    this.errorCode = 7
    this.statusCode = 401
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IncorrectCurrentPasswordError)
    } else {
      this.stack = (new Error()).stack
    }
  }
}

class NoAdminUserWithId extends Error {
  constructor () {
    super()
    this.message = 'There is no Admin user with such id.'
    this.name = 'NoAdminUserWithId'
    this.errorCode = 15
    this.statusCode = 404
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoAdminUserWithId)
    } else {
      this.stack = (new Error()).stack
    }
  }
}

let ret = {
  NoUserWithIdError: NoUserWithIdError,
  IncorrectCurrentPasswordError: IncorrectCurrentPasswordError,
  NoAdminUserWithId: NoAdminUserWithId
}

module.exports = ret
