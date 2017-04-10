'use strict'
const colors = require('colors/safe')

//
// Log levels:
//
// 0 - Only fatal errors
// 1 - Important runtime messages and errors
// 2 - All runtime messages, warnings and errors
// 3 - Everything, including dumps and database queries
//
// Usage:
//
// let log = require('./log')
// g.log(loglevel, any number of args here as this was console.log)
// g.log.w(loglevel, any number of args here as this was console.warn)
// g.log.e(loglevel, any number of args here as this was console.error)
//

let apiko

let log = function () {
  let args = Array.prototype.slice.call(arguments)

  if (args[0] <= apiko.config.verbosity) {
    args[0] = '[APIKO LOG ' + timestamp() + ']'
    console.log.apply(console, args)
  }
}

log.w = function () {
  let args = Array.prototype.slice.call(arguments)

  if (args[0] <= apiko.config.verbosity) {
    args[0] = '[APIKO WRN ' + timestamp() + ']'

    for (let i in args) {
      args[i] = colors.yellow(args[i])
    }

    console.warn.apply(console, args)
  }
}

log.e = function () {
  let args = Array.prototype.slice.call(arguments)

  if (args[0] <= apiko.config.verbosity) {
    args[0] = '[APIKO ERR ' + timestamp() + ']'

    for (let i in args) {
      args[i] = colors.red(args[i])
    }

    console.error.apply(console, args)
  }
}

log.d = function () {
  let args = Array.prototype.slice.call(arguments)

  for (let i in args) {
    args[i] = colors.bold(args[i])
  }

  console.error.apply(console, args)
}

module.exports = function (g) {
  apiko = g
  return log
}

function timestamp () {
  let time = new Date()
  let hours = ((time.getHours() < 10) ? '0' + time.getHours() : time.getHours())
  let minutes = ((time.getMinutes() < 10) ? '0' + time.getMinutes() : time.getMinutes())
  let seconds = ((time.getSeconds() < 10) ? '0' + time.getSeconds() : time.getSeconds())
  let millis = time.getMilliseconds()

  if ((millis < 100) && (millis >= 10)) {
    millis = '0' + millis
  }

  if (millis < 10) {
    millis = '00' + millis
  }

  return hours + ':' + minutes + ':' + seconds + '.' + millis
}
