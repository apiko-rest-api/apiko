module.exports = function genericGetOne (req, res, next) {
  let g = req.apiko;

  g.store.users.findOne({
    where: {
      username: req.all.username
    }
  })
  .then(user => {
    if (user) {
      res.success({ exists: true })
    } else {
      res.success({ exists: false })
    }
  })
  .catch(e => {
    res.error(400, 'Can\'t check if user exists')
  })
}