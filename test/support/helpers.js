const createUser = async (apiko, opts) => {
  if (!opts) opts = {}
  return apiko.store.users.create({
    username: opts.username || 'testuser@apiko.org',
    password: apiko.hashPassword(opts.password || 'TestPassword1'),
    role: opts.role || 'admin'
  })
}

const truncateUsers = async (apiko) => {
  return apiko.store.users.truncate()
}

const loginOpts = (body) => {
  if (!body) body = {}
  return {
    method: 'POST',
    uri: 'http://127.0.0.1:5000/users/login',
    body: {
      username: body.username || 'testuser@apiko.org',
      password: body.password || 'TestPassword1'
    },
    resolveWithFullResponse: true,
    json: true,
    simple: false
  }
}

const postOptions = (uri, body) => {
  if (!body) body = {}
  let opts = {
    method: 'POST',
    uri: uri,
    body: {
      old: body.old || 'TestPassword1',
      new: body.new || 'NewTestPassword1',
    },
    resolveWithFullResponse: true,
    json: true,
    simple: false
  }
  if (body && body.secret) {
    opts.body.secret = body.secret
  }
  if (body && body.token) {
    opts.body.token = body.token
  }
  return opts
}

module.exports = {
  createUser,
  truncateUsers,
  loginOpts,
  postOptions
}
