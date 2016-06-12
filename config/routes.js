var Index = require('../app/controllers/index')
var User = require('../app/controllers/user')
var Ti = require('../app/controllers/ti')
var Comment = require('../app/controllers/comment')
var Category = require('../app/controllers/category')

module.exports = function(app) {

  // pre handle user
  app.use(function(req, res, next) {
    var _user = req.session.user

    app.locals.user = _user

    next()
  })

  // Index
  app.get('/', Index.index)

  // User
  app.post('/user/signup', User.signup)
  app.post('/user/signin', User.signin)
  app.get('/signin', User.showSignin)
  app.get('/signup', User.showSignup)
  app.get('/logout', User.logout)
  app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list)

  // Movie
  app.get('/ti/:id', Ti.detail)
  app.get('/admin/ti/new', User.signinRequired, User.adminRequired, Ti.new)
  app.get('/admin/ti/update/:id', User.signinRequired, User.adminRequired, Ti.update)
  app.post('/admin/ti', User.signinRequired, User.adminRequired, Ti.saveImageContent, Ti.saveTags, Ti.save)
  app.get('/admin/ti/list', User.signinRequired, User.adminRequired, Ti.list)
  app.delete('/admin/ti/list', User.signinRequired, User.adminRequired, Ti.del)

  // Comment
  app.post('/user/comment', User.signinRequired, Comment.save)

  // Category
  app.get('/admin/category/new', User.signinRequired, User.adminRequired, Category.new)
  app.post('/admin/category', User.signinRequired, User.adminRequired, Category.save)
  app.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list)

  // results
  app.get('/results', Index.search)
}