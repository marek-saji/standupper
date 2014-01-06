var Strategy  = require('passport-google').Strategy,
    Promise   = require('mongoose').Promise,
    steps     = require('./steps'),
    serverCfg = require('../config').server;

module.exports = new Strategy(
  {
    returnURL: serverCfg.url + '/auth/google/callback',
    realm:     serverCfg.url + '/'
  },
  function googleStrategyVerifier (identifier, profile, resolveVerification)
  {
    profile.id = identifier;
    profile.provider = 'google';

    steps.find(profile)
      .then(steps.prepare)
      .then(steps.save)
      .onResolve(resolveVerification);
  }
);
