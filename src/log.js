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
// var log = require('./log')
// g.log(loglevel, any number of args here as this was console.log)
// g.log.w(loglevel, any number of args here as this was console.warn)
// g.log.e(loglevel, any number of args here as this was console.error)
//
var log = function () {
  var args = Array.prototype.slice.call(arguments)

  if (args[0] <= global.config.verbosity) {
    args[0] = '[APIKO LOG ' + timestamp() + ']'
    console.log.apply(console, args)
  }
}

log.w = function () {
  var args = Array.prototype.slice.call(arguments)

  if (args[0] <= global.config.verbosity) {
    args[0] = '[APIKO WRN ' + timestamp() + ']'

    for (let i in args) {
      args[i] = colors.yellow(args[i])
    }

    console.warn.apply(console, args)
  }
}

log.e = function () {
  var args = Array.prototype.slice.call(arguments)

  if (args[0] <= global.config.verbosity) {
    args[0] = '[APIKO ERR ' + timestamp() + ']'

    for (let i in args) {
      args[i] = colors.red(args[i])
    }

    console.error.apply(console, args)
  }
}

log.d = function () {
  var args = Array.prototype.slice.call(arguments)

  for (let i in args) {
    args[i] = colors.bold(args[i])
  }

  console.error.apply(console, args)
}

module.exports = log

function timestamp() {
  var time = new Date()
  var hours = ((time.getHours() < 10) ? '0' + time.getHours() : time.getHours())
  var minutes = ((time.getMinutes() < 10) ? '0' + time.getMinutes() : time.getMinutes())
  var seconds = ((time.getSeconds() < 10) ? '0' + time.getSeconds() : time.getSeconds())
  var millis = time.getMilliseconds()

  if ((millis < 100) && (millis >= 10)) {
    millis = '0'+millis
  }

  if (millis < 10) {
    millis = '00'+millis
  }

  return hours + ':' + minutes + ':' + seconds + '.' + millis
}