module.exports = function(app) {
  app.use('/', require('./home'));
  app.use('/login', require('./login'));
  app.use('/users', require('./users'));
  app.use('/chat', require('./chat'));
  app.use('/logout', require('./logout'));
}
