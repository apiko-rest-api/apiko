'use strict'
module.exports = function (req, res, next) {
  let g = req.apiko
  renderer.g = g
  renderer.req = req

  if (g.config.protect) {
    if (req.all.secret !== g.manager.setup.secret) {
      res.status(401)
      res.send(renderer.renderError())
      return
    }
  }

  res.status(200)
  res.send(renderer.renderDocs())
}

let renderer = {
  renderDocs () {
    let content = '<h1 class="title is-1" style="text-align: center;">API Reference</h1>'

    content += '<section style="margin-bottom: 40px"><h3>Table of Contents</h3><table><tbody>'

    for (let endpoint in this.g.ender.endpoints) {
      content += '<tr><td><strong>' + endpoint.split(' ')[0] + '</strong></td><td><a href="#' + endpoint + '">' + endpoint.split(' ')[1] + '</a></td><td>' + (this.g.ender.endpoints[endpoint].comment ? this.g.ender.endpoints[endpoint].comment : '') + '</td></tr>'
    }
    content += '<tbody></table></section>'

    let end, restriction
    for (let endpoint in this.g.ender.endpoints) {
      end = this.g.ender.endpoints[endpoint]

      if (end.extendable || this.req.all.core) {
        if (end.restrict) {
          if (end.restrict === true) {
            restriction = ' <small><span class="tag is-light">Requires</span> <span class="tag is-primary">Login</span></small>'
          } else {
            restriction = ' <small><span class="tag is-light">Requires Roles</span> <span class="tag is-info">' + end.restrict.split(',').join('</span> <span class="tag is-info">') + '</span></small>'
          }
        } else {
          restriction = ''
        }

        content += '<section class="box"><h2 class="title is-2" id="' + endpoint + '">' + endpoint + restriction + '</h2>'

        if (end.comment) {
          content += '<p>' + end.comment + '</p>'
        }

        let endpointDetail = ''

        if (end.params) {
          let params = ''
          for (let param in end.params) {
            params += this.apply('endpointParamsRow', {
              param: param,
              required: (end.params[param].required ? ' <small><span class="tag is-light">Required</span></small>' : ''),
              regex: (end.params[param].regex ? '<code>/' + end.params[param].regex + '/</code>' : 'none'),
              comment: (end.params[param].comment ? end.params[param].comment : '')
            })
          }

          endpointDetail += '<h4 class="title is-4" style="margin-top: 40px;">Request Parameters</h4>'
          endpointDetail += this.apply('endpointParamsTable', { content: params })
        }

        if (end.response) {
          let response = ''
          for (let property in end.response) {
            response += this.apply('endpointResponseRow', {
              property: property,
              type: (end.response[property].type ? end.response[property].type : ''),
              present: (end.response[property].present ? end.response[property].present : ''),
              comment: (end.response[property].comment ? end.response[property].comment : '')
            })
          }

          endpointDetail += '<h4 class="title is-4" style="margin-top: 40px;">Response Properties</h4>'
          endpointDetail += this.apply('endpointResponseTable', { content: response })
        }

        if (end.errors) {
          let errors = ''
          for (let error in end.errors) {
            errors += this.apply('endpointErrorsRow', {
              id: error,
              message: end.errors[error]
            })
          }

          endpointDetail += '<h4 class="title is-4" style="margin-top: 40px;">Errors</h4>'
          endpointDetail += this.apply('endpointErrorsTable', { content: errors })
        }

        if (endpointDetail) {
          content += '<div class="endpoint-collabsible">' + endpointDetail + '</div>'
        }
      }

      content += '</section>'
    }

    content = this.apply('docsWrapper', { content: content })
    content = this.apply('page', { content: content })
    return content
  },

  renderError () {
    let content = '<h1 class="title">Access Denied</h1>'
    content += '<p>This server is protected by a secret that has to be supplied in the \'secret\' parameter. (Error 3)</p>'

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
    endpointErrorsRow: '<tr><td>{{id}}</td><td>{{message}}</td></tr>',
    endpointErrorsTable: '<table><thead><tr><th>#</th><th>Message</th></tr></thead><tbody>{{content}}</tbody></table>',
    endpointResponseRow: '<tr><td><strong>{{property}}</strong></td><td>{{type}}</td><td>{{present}}</td><td>{{comment}}</td></tr>',
    endpointResponseTable: '<table><thead><tr><th>Property</th><th>Type</th><th>Present</th><th>Comment</th></tr></thead><tbody>{{content}}</tbody></table>',
    endpointParamsRow: '<tr><td><strong>{{param}}</strong>{{required}}</td><td>{{regex}}</td><td>{{comment}}</td></tr>',
    endpointParamsTable: '<table><thead><tr><th>Name</th><th>Regular Expression</th><th>Comment</th></tr></thead><tbody>{{content}}</tbody></table>',
    docsWrapper: '<div class="content">{{content}}</div>',
    errorWrapper: '<div class="content" style="text-align: center;">{{content}}</div>',
    page: '<!DOCTYPE html>' +
           '<html lang="en">' +
           '<head>' +
           '<meta charset="utf-8">' +
           '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
           '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">' +
           '<title>API Reference</title>' +
           '<link href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.3.2/css/bulma.css" rel="stylesheet">' +
           '<style>' +
           'body { padding-top: 40px; padding-bottom: 40px; }' +
           '.content { width: 50%; margin: auto; }' +
           '@media screen and (max-width: 700px) { .content { width: 70%; } }' +
           '@media screen and (max-width: 400px) { .content { width: 90%; } }' +
           '</style>' +
           '</head>' +
           '<body>{{content}}</body>' +
           '</html>'
  }
}
