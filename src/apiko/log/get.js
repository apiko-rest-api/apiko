'use strict'

const fs = require('fs')
const readline = require('readline')

module.exports = function (req, res, next) {
  let g = req.apiko
  renderer.g = g
  renderer.req = req
  
  g.log(2, 'Retrieving the log file content...')

  if (g.config.protect) {
    if (req.all.secret !== g.manager.setup.secret) {
      res.status(401)
      res.send(renderer.renderError())
      return
    }
  }

  if (fs.existsSync('apiko.log')) {
    res.status(200)
    renderer.renderLog(res, next)
  } else {
    g.log.e(1, 'Log was requested, but apiko.log does not exist. Did you set the logFile configuration property to false?')
    res.status(404)
    res.send(renderer.renderErrorNoLog())
  }
}

let renderer = {
  renderLog (res) {
    res.write(this.templates.pageStart)

    let lineReader = readline.createInterface({
      input: fs.createReadStream('apiko.log')
    })

    lineReader.on('line', (line) => {
      line = line.split(' ')
      let message = line.slice() // copy the array
      message.splice(0, 3)
      message = message.join(' ')
      let time = line[2].replace(']', '')

      switch (line[1]) {
        case 'LOG': res.write(this.apply('logInf', { type: line[1], message: message, time: time })); break
        case 'WRN': res.write(this.apply('logWrn', { type: line[1], message: message, time: time })); break
        case 'ERR': res.write(this.apply('logErr', { type: line[1], message: message, time: time })); break
        default: res.write(this.apply('logDefault', { message: line.join(' ') }))
      }
    })
    
    lineReader.on('close', () => {
      res.write(this.templates.refresher)
      res.write(this.templates.pageEnd)
      res.end()
    })
  },

  renderError () {
    let content = '<h1 class="title">Access Denied</h1>'
    content += '<p>This server is protected by a secret that has to be supplied in the \'secret\' parameter. (Error 3)</p>'

    content = this.apply('errorWrapper', { content: content })
    content = this.apply('page', { content: content })
    return content
  },

  renderErrorNoLog () {
    let content = '<h1 class="title">No Log File</h1>'
    content += '<p>Log was requested, but apiko.log does not exist. Did you set the logFile configuration property to false? (Error 14)</p>'

    content = this.apply('errorWrapper', { content: content })
    content = this.apply('page', { content: content })
    return content
  },

  apply (template, opts) {
    let tpl = this.templates[template]

    if (tpl) {
      for (let label in opts) {
        tpl = tpl.split('{{' + label + '}}').join(opts[label])
      }
    }

    return tpl
  },

  templates: {
    logDefault: '<tr><td colspan="3">{{message}}</td></tr>',
    logWrn: '<tr><td><span class="tag is-warning is-small">{{type}}</span></td><td>{{message}}</td><td><span class="time">{{time}}</span></td></tr>',
    logInf: '<tr><td><span class="tag is-success is-small">{{type}}</span></td><td>{{message}}</td><td><span class="time">{{time}}</span></td></tr>',
    logErr: '<tr><td><span class="tag is-danger is-small">{{type}}</span></td><td>{{message}}</td><td><span class="time">{{time}}</span></td></tr>',
    errorWrapper: '<div class="content" style="text-align: center;">{{content}}</div>',
    page:  '<!DOCTYPE html>' +
           '<html lang="en">' +
           '<head>' +
           '<meta charset="utf-8">' +
           '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
           '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">' +
           '<title>API Log</title>' +
           '<link href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.3.2/css/bulma.css" rel="stylesheet">' +
           '<style>' +
           'body { padding: 10px; }' +
           'time { color: #bbbbbb }' +
           '</style>' +
           '</head>' +
           '<body>{{content}}</body>' +
           '</html>',
    pageStart:'<!DOCTYPE html>' +
             '<html lang="en">' +
             '<head>' +
             '<meta charset="utf-8">' +
             '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
             '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">' +
             '<title>API Log</title>' +
             '<link href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.3.2/css/bulma.css" rel="stylesheet">' +
             '<style>' +
             '.time { color: #bbbbbb }' +
             '</style>' +
             '</head>' +
             '<body><div class="content"><table><tbody>',
    refresher: '<script>window.refreshLog = function () { location.reload(); }; window.setTimeout(window.refreshLog, 10000); window.setTimeout("window.scrollTo(0, document.body.scrollHeight)", 250);</script>',
    pageEnd: '</tbody></table></div></body></html>'
  }
}
