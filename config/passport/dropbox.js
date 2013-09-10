var Strategy = require('passport-dropbox').Strategy,
    Promise  = require('mongoose').Promise,
    steps    = require('./steps'),
    config   = require('../config').keys.dropbox;

module.exports = new Strategy(
  {
    consumerKey:    config.id,
    consumerSecret: config.secret,
    callbackURL: 'http://localhost.dev:3000/auth/dropbox/callback'
  },
  function dropboxStrategyVerifier (token, tokenSecret, profile, resolveVerification)
  {
    steps.find(profile)
      .then(steps.prepare)
      .then(steps.save)
      .onResolve(resolveVerification);
  }
);