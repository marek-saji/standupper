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
 * [✓] distribute new user in a day
 *
 * ### client
 *
 * [✓] export methods
 * [✓] initialize
 * [✓] save+redraw one user's entry
 * [✓] new users
 * [ ] no auto-adding self to the stand
 * [ ] navigating through days (input[type=date])
 */

/**
 * Modules
 */
var http   = require("http"),
    // serving static files
    send   = require("send"),
    // mongo db
    db     = require("mongojs").connect(process.env.npm_package_config_mongourl, ["users", "entries"]),
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
server.listen(
    process.env.npm_package_config_port,
    process.env.npm_package_config_ip
);
console.log(
    "Running on http://%s:%s",
    process.env.npm_package_config_ip,
    process.env.npm_package_config_port
);


/**
 * New client connected through `now`.
 */
now.on("connect", function () {
    console.log("Connected:", this.user.clientId);
    this.now.debug = !! process.env.npm_package_config_debug;
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
 */
everyone.now.storeEntry = function (date, entry, success, failure) {
    date = new Date(date); // may be a Date or string
    var dayDate = new Date(date.toDateString()),
        win, fail,
        entriesFindWin,
        userIdent,
        newEntry,
        entryQuery, entrySort;

    win = function () {
        everyone.exclude([this.user.clientId]).now.drawEntry(newEntry);
        success(newEntry);
    }.bind(this);

    fail = failure;

    newEntry = {
        date       : dayDate,
        user       : entry.user_id    || this.user.user.name,
        user_id    : entry.user       || this.user.user._id,
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
    var callback = (process.env.npm_package_config_debug ? yes : no);
    if (typeof callback === "function") {
        callback();
    }
};

if (process.env.npm_package_config_debug) {
    /**
     * Remove everything from the database and request client reset.
     */
    everyone.now.resetServer = function () {
        db.entries.remove({});
        db.users.remove({});
        this.now.resetClient();
    };
}
