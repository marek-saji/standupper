var mongoose = require('mongoose'),
    Promise  = mongoose.Promise,
    User     = mongoose.model('User'),
    find, prepare, save;


// mongoose promises suck and pass only 1st arg to then()

find = function (profile) {
  var promise = new Promise(),
      findUserQuery,
      emails;

  emails = (profile.emails || []).map(function (entry) {
    return entry.value;
  }).filter(function (entry) {
    return !!entry;
  });

  if (emails.length)
  {
    findUserQuery = User.findByEmails(emails);
  }
  else
  {
    findUserQuery = User.findByProvider(profile.provider, profile.id);
  }

  findUserQuery.exec()
    .onFulfill(function (user) {
      promise.fulfill([user, emails, profile]);
    })
    .onReject(function (reason) {
      promise.reject(reason);
    });

  return promise;
};


prepare = function (result) {
  var user = result[0],
      emails = result[1],
      profile = result[2],
      accessToken = result[3];
  var promise = new Promise();

  if (null === user)
  {
    user = new User();
  }

  user.displayName = profile.displayName;
  if (profile.photos && profile.photos[0] && profile.photos[0].value)
  {
    user.avatarUrl = profile.photos[0].value;
  }

  user.emails = (user.emails || []).concat(emails);

  user.ids.push({
    provider: profile.provider,
    id:       profile.id
  });

  promise.fulfill([user, profile, accessToken]);
  return promise;
};


save = function (result) {
  var user = result[0],
      profile = result[1],
      accessToken = result[2];
  var promise = new Promise();
  // TODO
  if (false && !user.isModified())
  {
    promise.fulfill(user);
  }
  else
  {
    user.save(promise.resolve.bind(promise));
  }
  return promise;
};


module.exports = {
  find:    find,
  prepare: prepare,
  save:    save
}