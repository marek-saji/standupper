module.exports = function (app, config) {

  var includeConfig = function (req, res, next) {
    res.locals.config = config;
    return next();
  };

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
    includeConfig
  ];

  var authorizedAccessOnly = common.concat([
    requireAuthenticated
  ]);

  app.get('/', function (req, res) {
    res.redirect('/plan');
  });

  var plan = require('../app/controllers/plan');
  app
    .get ('/plan', authorizedAccessOnly, plan.index)
    .post('/plan', authorizedAccessOnly, plan.save);

  // auth
  var auth = require('../app/controllers/auth');
  app
    .get('/auth',   common, auth.auth)
    .get('/deauth', auth.deauth)
    .get(/^\/auth\/([a-z]+)(?:\/callback)?/, auth.strategy);

};
