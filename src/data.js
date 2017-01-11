module.exports = {
  store: null,

  init () {
    g.log(2, 'Connecting database...')

    this.store = new Sequelize(g.config.db.name, g.config.db.user, g.config.db.pass, {
      host: g.config.db.host,
      dialect: g.config.db.dialect,
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      storage: g.config.db.storage,
      logging (msg) {
        g.log(3, msg)
      }
    })

    g.log(2, 'Database connected.')
  },

  sync () {
    g.log(2, 'Synchronizing database...')

    // core collections
    var usersP = this.addCollection('users', {
      id: { type: g.Sequelize.INTEGER, primaryKey: true },
      username: { type: g.Sequelize.STRING(100) },
      password: { type: g.Sequelize.STRING(100) }
    }).then(() => {
      g.log(3, 'Users structure synchronized.')
    })

    // load collections from g.manager.setup.collections here and sync them

    return Promise.all([usersP])
  },

  addCollection (name, fields) {
    var collection = this.store.define(name, fields, {
      freezeTableName: true // Model tableName will be the same as the model name
    })

    return collection.sync({ force: false })
  }
}