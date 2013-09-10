module.exports = function (app) {

  var requireAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
    {
      return next();
    }
    else
    {
      return res.redirect('/auth');
    }
  };

  var common = [
    requireAuthenticated
  ];

  app.get('/', function (req, res) {
    res.redirect('/plan');
  });

  var plan = require('../app/controllers/plan');
  app
    .get ('/plan', common, plan.index)
    .post('/plan', common, plan.save);

  // auth
  var auth = require('../app/controllers/auth');
  app
    .get('/auth',   auth.auth)
    .get('/deauth', auth.deauth)
    .get(/^\/auth\/([a-z]+)(?:\/callback)?/, auth.strategy);

};
