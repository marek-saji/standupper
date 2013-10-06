var Strategy  = require('passport-dropbox').Strategy,
    Promise   = require('mongoose').Promise,
    steps     = require('./steps'),
    config    = require('../config'),
    keysCfg   = config.keys.dropbox,
    serverCfg = config.server;

module.exports = new Strategy(
  {
    consumerKey:    keysCfg.id,
    consumerSecret: keysCfg.secret,
    callbackURL: 'http://' + serverCfg.host + ':' + serverCfg.port + '/auth/dropbox/callback'
  },
  function dropboxStrategyVerifier (token, tokenSecret, profile, resolveVerification)
  {
    steps.find(profile)
      .then(steps.prepare)
      .then(steps.save)
      .onResolve(resolveVerification);
  }
);
