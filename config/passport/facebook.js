var Strategy = require('passport-facebook').Strategy,
    Promise  = require('mongoose').Promise,
    steps    = require('./steps'),
    config   = require('../config').keys.facebook;

module.exports = new Strategy(
  {
    clientID:     config.id,
    clientSecret: config.secret,
    callbackURL:  'http://localhost.dev:3000/auth/facebook/callback',
    scope:        [ 'email' ]
  },
  function faceBookStrategyVerifier (accessToken, refreshToken, profile, resolveVerification)
  {
    steps.find(profile)
      .then(steps.prepare)
      .then(steps.save)
      .onResolve(resolveVerification);
  }
);