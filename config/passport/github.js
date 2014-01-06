var Strategy = require('passport-github').Strategy,
    Promise  = require('mongoose').Promise,
    https    = require('https'),
    steps    = require('./steps'),
    config   = require('../config').keys.github;


var prepareGitHub = function (profile, accessToken) {
  var promise = new Promise;

  // photos
  if (!profile.photos)
  {
    profile.photos = [ { value: profile._json.avatar_url } ];
  }

  // emails
  https.get({
    hostname:  'api.github.com',
    path:      '/user/emails',
    headers: {
      'Authorization':  'token ' + accessToken,
      'User-Agent':      'marek-saji/standupper'
    }
  }, function (res) {
    var json = '';

    res.on('data', function (data) {
      json += data;
    });
    res.on('end', function () {
      try
      {
        profile.emails = JSON.parse(json).map(function (email) {
          return { value: email };
        });
      }
      catch (error)
      {
        console.error("Failed to fetch user's e-mails: " + error + ". JSON: " + json);
      }
      promise.fulfill(profile);
    });
  }).on('error', function (error) {
    promise.reject(error);
  });

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