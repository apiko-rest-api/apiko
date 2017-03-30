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

class IncorrectOldPasswordError extends Error {
  constructor () {
    super()
    this.message = 'Incorrect old password.'
    this.name = 'IncorrectOldPasswordError'
    this.errorCode = 7
    this.statusCode = 401
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IncorrectOldPasswordError)
    } else {
      this.stack = (new Error()).stack
    }
  }
}

let ret = {
  NoUserWithIdError: NoUserWithIdError,
  IncorrectOldPasswordError: IncorrectOldPasswordError
}

module.exports = ret
