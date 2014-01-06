var passport = require('passport'),
    config = require('../../config/config');


exports.auth = function (req, res) {
  var strategies = Object.keys(passport._strategies);
  res.render('auth/login', {
    strategies: strategies
  });
};

exports.deauth = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.strategy = function (req, res, next) {
  var strategy = req.params[0];
  if (passport._strategies[ strategy ])
  {
    return passport.authenticate(req.params[0], {
      failureRedirect: config.server.url + '/auth',
      successRedirect: config.server.url + '/'
    }).apply(this, arguments);
  }
  else
  {
    res.redirect('/auth');
  }
};