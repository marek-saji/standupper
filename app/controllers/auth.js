var passport = require('passport');


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
      failureRedirect: '/auth',
      successRedirect: '/'
    }).apply(this, arguments);
  }
  else
  {
    res.redirect('/auth');
  }
};