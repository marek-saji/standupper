var passport   = require('passport');

// FIXME trully serialize and deserialize user
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


passport.use(require('./passport/github'));
passport.use(require('./passport/google'));
passport.use(require('./passport/dropbox'));
passport.use(require('./passport/facebook'));

module.exports = passport;