var io,
    parseCookie = require('express').cookieParser;

module.exports = function (server) {

  if (undefined === io)
  {
    if (!server)
    {
      throw new Error('Initializing Sockets.IO requires `server\' argument');
    }
    else
    {
      io = require('socket.io').listen(server);

      // TODO does this even work?
      // maybe move that to express.js (session init)
      io.set('authorization', function (data, accept) {
        if (data.headers.cookie)
        {
          data.cookie = parseCookie(data.headers.cookie);
          data.sessionID = data.cookie['connect.sid'];
        }
        else
        {
          return accept('No cookie transmitted.', false);
        }

        return accept(null, true);
      });
    }
  }

  return io;
};
