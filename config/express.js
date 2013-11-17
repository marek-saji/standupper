var express  = require('express'),
    MongoStore = require('connect-mongo')(express);
    passport = require('./passport');

module.exports = function(app, server, config) {
  app.configure(function () {
    app.use(express.compress());
    app.use(express.static(config.root + '/public'));
    app.set('port', config.server.port);
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');
    app.use(express.favicon(config.root + '/public/img/favicon.ico'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());

    var sessionSecret = 'OHAI',
        store = new MongoStore({
          url: config.db
        });
    app.use(express.session({
      secret: sessionSecret,
      store: store
    }));

    app.use(express.methodOverride());
    app.use(passport.initialize());
    app.use(passport.session());

    var io = require('../js/io')(server),
        passportSocketIo = require('passport.socketio');

    io.set("authorization", passportSocketIo.authorize({
      cookieParser: express.cookieParser,
      key:     'connect.sid',
      secret:  sessionSecret,
      store:   store,
      fail: function (data, message, critical, accept) {
        accept(null, false);
      },
      success: function (data, accept) {
        accept(null, true);
      }
    }));

    app.use(app.router);
    app.use(function(req, res) {
      res.status(404).render('404', { title: '404' });
    });
  });
};
