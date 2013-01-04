"use strict";
/**
 * TODO
 * ----
 *
 * ### organize code
 *
 * [ ] "if () {" vs. "if ()\n{"
 * [ ] find a good/great documenting convention
 * [ ] split server.js
 * [ ] make jshint behave
 *
 * ### server
 *
 * [ ] sanitize params
 * [✓] register as existing or new user
 * [✓] get all entries for a day
 * [✓] update user's entry for a day
 * [ ] distribute new user in a day
 *
 * ### client
 *
 * [✓] export methods
 * [✓] initialize
 * [✓] save+redraw one user's entry
 * [ ] new users
 * [ ] no auto-adding self to the stand
 * [ ] navigating through days (input[type=date])
 */

/**
 * default settings
 */
var settings = {
    IP       : '0.0.0.0', // all addresses
    PORT     : 8000,
    MONGOURL : 'standupper',
    DEBUG    : 0
};

/**
 * Load settings
 *
 * Prefer environment variables over `settings`
 */
(function () {
    var idx;
    for (idx in settings) {
        if (settings.hasOwnProperty(idx)) {
            settings[idx] = process.env[idx] || settings[idx];
        }
    }
}());


/**
 * Modules
 */
var http   = require("http"),
    // serving static files
    send   = require("send"),
    // mongo db
    db     = require("mongojs").connect(settings.DBNAME, ["users", "entries"]),
    // cryptography (sed to calculate MD5 hashes)
    crypto = require("crypto"),
    // neat wrapper to socket.io
    now    = require("now");


/**
 * Wrapper to split mongojs's single callback into two.
 *
 * @param {function} success Called when callback is successful.
 * @param {function} failure Called when error occured
 */
var dbResponse = function dbResponse (success, failure) {
    return function (error/*,  … */) {
        var argv = Array.prototype.slice.call(arguments, 0);
        if (null !== error) {
            console.error('DB ERROR', error);
            failure.apply(this, argv);
        } else {
            argv.shift(); // remove `error`
            success.apply(this, argv);
        }
    };
};


/**
 * Create HTTP server for serving static content.
 */
var server = http.createServer(function (req, res) {
    send(req, req.url)
        .root(__dirname + '/static/')
        .pipe(res);
});
server.listen(settings.PORT, settings.IP);
console.log("Running on http://%s:%s", settings.IP, settings.PORT);


/**
 * New client connected through `now`.
 */
now.on("connect", function () {
    console.log("Connected:", this.user.clientId);
    this.now.debug = !! settings.DEBUG;
});

/**
 * Client disconnected through `now`.
 */
now.on("disconnect", function () {
    console.log("Disconnected:", this.user.clientId);
});



// now user group: everyone
var everyone = now.initialize(server);

/**
 * everyone.now scope is shared with client
 */

/**
 * Register new user or auth existing one
 *
 * @param {string} userName
 * @param {function} success
 * @param {function} failure
 */
everyone.now.register = function (userName, success, failure) {
    var win, fail,
        usersFindWin,
        createNewUser,
        userQuery;

    userQuery = {
        name : userName
    };

    win = function (user) {
        this.user.registered = true;
        this.user.user = user;
        success.apply(this, arguments);
    }.bind(this);

    fail = function () {
        this.user.registered = false;
        delete this.user.user;
        failure.apply(this, arguments);
    }.bind(this);

    createNewUser = function (userName, success, failure) {
        var newUser = {
            name : userName,
            mail : ""
        };
        db.users.save(newUser, dbResponse(success, failure));
    };


    usersFindWin = function (foundUsers) {
        if (1 === foundUsers.length) {
            // got single user from db
            console.log('Returning user: ', foundUsers[0]);
            win(foundUsers[0]);
        } else if (0 === foundUsers.length) {
            // no hits — add new user
            createNewUser(userName, win, fail);
        } else {
            // more than one hit — something's wrong
            console.error('Got more than one user with name', userName);
            fail();
        }
    };

    db.users.find(userQuery, dbResponse(usersFindWin, fail));
};



/**
 * Fetch all entries in a day
 *
 * @param {Date|string} date
 * @param {function} success
 * @param {function} failure
 */
everyone.now.initializeDay = function (date, success, failure) {
    date = new Date(date); // may be a Date or string
    var dayDate = new Date(date.toDateString()),
        win, fail,
        entriesQuery;

    entriesQuery = {
        date : dayDate
    };

    win  = success;
    fail = failure;

    db.entries.find(entriesQuery, dbResponse(win, fail));
};



/**
 * Write new or update existing user's entry for a day
 *
 * @param {Date|string} date
 * @param {Object} entry
 *        Must contain:
 *        - {string} entry.prev
 *        - {string} entry.next
 *        - {string} entry.obstacles
 *        May contain:
 *        - {string} entry.user_id Defaults to current `user.name`.
 *        - {string} entry.user_ Defaults to current `user._id`.
 *        - {string} entry.user_ident Defaults to current `user.mail` md5 hash.
 */
everyone.now.storeEntry = function (date, entry, success, failure) {
    date = new Date(date); // may be a Date or string
    var dayDate = new Date(date.toDateString()),
        win, fail,
        entriesFindWin,
        newEntry,
        entryQuery, entrySort;

    win = function () {
        everyone.exclude([this.user.clientId]).now.drawEntry(this.user.user._id, newEntry);
        success(newEntry);
    }.bind(this);

    fail = failure;

    newEntry = {
        date       : dayDate,
        user       : entry.user_id    || this.user.user.name,
        user_id    : entry.user       || this.user.user._id,
        user_ident : entry.user_ident || crypto.createHash("md5").update(String(this.user.user.mail)).digest("hex"),
        prev       : entry.prev,
        next       : entry.next,
        obstacles  : entry.obstacles
    };

    entryQuery = {
        date    : dayDate,
        user_id : this.user.user._id
    };
    entrySort = {
        _id : 1
    };

    entriesFindWin = function (foundEntries) {
        if (0 === foundEntries.length) {
            db.entries.save(newEntry, dbResponse(win, fail));
        } else {
            // make id accessible by saveCallback
            newEntry._id = foundEntries[0]._id;
            db.entries.update(entryQuery, newEntry, dbResponse(win, fail));
        }
    };



    db.entries.find(entryQuery).sort(entrySort, dbResponse(entriesFindWin, fail));
};


/**
 * Check whether debug is active
 *
 * @param {function} yes Called when debug is active.
 * @param {function} no  Called when debug is not active.
 */
everyone.now.gotDebug = function (yes, no) {
    var callback = (settings.DEBUG ? yes : no);
    if (typeof callback === "function") {
        callback();
    }
};

if (settings.DEBUG) {
    /**
     * Remove everything from the database and request client reset.
     */
    everyone.now.resetServer = function () {
        db.entries.remove({});
        db.users.remove({});
        this.now.resetClient();
    };
}
