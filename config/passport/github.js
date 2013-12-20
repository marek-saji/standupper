var Strategy = require('passport-github').Strategy,
    Promise  = require('mongoose').Promise,
    https    = require('https'),
    steps    = require('./steps'),
    config   = require('../config').keys.github;


var prepareGitHub = function (profile, accessToken) {
  var promise = new Promise;

  // photos
  profile.photos = [ { value: profile._json.avatar_url } ];

  // emails
  var request = https.get({
    hostname:  'api.github.com',
    path:      '/user/emails',
    headers: {
      'Authorization':  'token ' + accessToken,
      'UserAgent':      'marek-saji/standupper'
    }
  }, function (res) {
    res.on('readable', function () {
      var chunk,
          json = '',
          emails;
      while (chunk = res.read()) json += chunk;
      profile.emails = JSON.parse(json).map(function (email) {
        return { value: email };
      });
      promise.fulfill(profile);
    });
  });

  request.on('error', promise.reject);

  return promise;
};

module.exports = new Strategy(
  {
    scope:        'user',
    clientID:     config.id,
    clientSecret: config.secret
  },
  function gitHubStrategyVerifier (accessToken, refreshToken, profile, resolveVerification)
  {
    prepareGitHub(profile, accessToken)
      .then(steps.find)
      .then(steps.prepare)
      .then(steps.save)
      .onResolve(resolveVerification);
  }
);