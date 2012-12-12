window.storage = (function (localStorage, undefined) {
    "use strict";

    // methods
    var get, set;

    get = function (key) {
        var value = localStorage.getItem(key);
        try {
            return JSON.parse(value);
        } catch (e) {
            return null;
        }
    };

    set = function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };

    // rexpose public methods
    return {
        get : get,
        set : set
    };
}(window.localStorage));
