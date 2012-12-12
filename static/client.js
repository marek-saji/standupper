window.client = (function (window, document, undefined) {
    "use strict";

        // methods
    var init,
        _initNow,
        _init,
        _isCoolEnough,
        _registered,
        getUser,
        storeUser,
        // properties
        _user;



    // check if everything we expect to be working is present
    _isCoolEnough = function () {
        var inputElement = document.createElement("input"),
            isCool;

        isCool = (
            typeof document.querySelectorAll !== "function"
            ||
            typeof document.querySelector !== "function"
            ||
            typeof window.localStorage !== "object"
            ||
            typeof Array.prototype.forEach !== "function"
            ||
            typeof Array.prototype.some !== "function"
            ||
            typeof JSON !== "object"
            ||
            typeof JSON.stringify !== "function"
            ||
            typeof JSON.parse !== "function"
            ||
            typeof inputElement.dataset !== "object"
            ||
            typeof inputElement.classList !== "object"
            ||
            typeof inputElement.oninput === undefined
            ||
            typeof inputElement.addEventListener !== "function"
            ||
            typeof Date.prototype.toISOString !== "function"
        );

        if (!isCool) {
            // TODO message
            UI.fatalError();
        }

        return isCool;
    };

    init = function () {
        if (_isCoolEnough) {
            _initNow(_init, UI.fatalError);
        }
    };

    getUser = function () {
        if (undefined === _user) {
            _user = storage.get("user");
        }
        return _user;
    };

    storeUser = function (user) {
        storage.set("user", user);
        _user = user;
    };

    _initNow = function (success, failure) {
        if (undefined === now) {
            failure();
        } else {
            now.ready(function () {
                // expose code for server to call
                now.redrawEntry = UI.redrawEntry;
                now.gotDebug(function () {
                    now.resetClient = function () {
                        storage.set("user", null);
                        window.location.reload(false);
                    };
                });

                success();
            });
        }
    };

    _init = function () {
        var user;

        user = getUser();
        if (null === user) {
            user= {
                name : window.prompt("Enter existing or new user's name")
            };
        }


        now.register(user.name, _registered, UI.fatalError);
    };

    _registered = function (user, returning) {
        if (returning) {
            console.log('Welcome back,', user);
        } else {
            console.log('Welcome,', user);
        }
        storeUser(user);

        UI.init();
    };

    // expose public methods
    return {
        init : init,
        getUser : getUser,
        storeUser : storeUser
    };
}(window, window.document));
