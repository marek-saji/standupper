var Strategy  = require('passport-facebook').Strategy,
    Promise   = require('mongoose').Promise,
    steps     = require('./steps'),
    config    = require('../config'),
    keysCfg   = config.keys.facebook,
    serverCfg = config.server;

module.exports = new Strategy(
  {
    clientID:     keysCfg.id,
    clientSecret: keysCfg.secret,
    callbackURL:  'http://' + serverCfg.host + ':' + serverCfg.port + '/auth/facebook/callback',
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
