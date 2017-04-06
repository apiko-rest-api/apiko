const createUser = async (apiko, username, password, role) => {
  return apiko.store.users.create({
    username: username || 'testuser',
    password: apiko.hashPassword(password || 'TestPassword1'),
    role: role || 'admin'
  })
}

const truncateUsers = async (apiko) => {
  return apiko.store.users.truncate()
}

module.exports = {
  createUser,
  truncateUsers
}
