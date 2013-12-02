module.exports = function (app, config) {

  var includeConfig = function (req, res, next) {
    res.locals.config = config;
    return next();
  };

  var Plan = require('mongoose').model('Plan');

  var requireAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
    {
      res.locals.user = req.user;
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

  app.get('/atomic', common, require('../app/controllers/atomic').index);

  app.get('/', function (req, res) {
    res.redirect('/plan');
  });

  app.get('/plan', function (req, res) {
    var date = req.query.date || Plan.dateToISODateString(new Date());
    res.redirect('/plan/' + date);
  });

  var plan = require('../app/controllers/plan');
  app
    .get ('/plan/:date', authorizedAccessOnly, plan.index)
    .post('/plan/:date', authorizedAccessOnly, plan.save);

  // auth
  var auth = require('../app/controllers/auth');
  app
    .get('/auth',   common, auth.auth)
    .get('/deauth', auth.deauth)
    .get(/^\/auth\/([a-z]+)(?:\/callback)?/, auth.strategy);

};
