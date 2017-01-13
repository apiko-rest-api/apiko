module.exports = function (request, store) {
  if (g.config.protect) {
    if (request.params.secret == g.manager.setup.secret) {
      request.respondSuccess(g.manager.setup)
    } else {
      request.respondError(401, 'This server is protected by a secret that has to be supplied as the \'secret\' parameter.', 1)
    }
  } else {
    request.respondSuccess(g.manager.setup)
  }
}