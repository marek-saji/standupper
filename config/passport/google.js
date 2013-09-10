var Strategy = require('passport-google').Strategy,
    Promise  = require('mongoose').Promise,
    steps    = require('./steps');

module.exports = new Strategy(
  {
    returnURL: 'http://localhost:3000/auth/google/callback',
    realm:     'http://localhost:3000/'
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