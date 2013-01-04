/**
 * Use `localStorage` with automatic JSON {,de}serialization.
 */
window.storage = (function (localStorage, undefined) {
    "use strict";

    // methods
    var get, set;

    /**
     * Get an item
     *
     * @param {string} key
     *
     * @returns Stored value or `null`.
     */
    get = function (key) {
        var value = localStorage.getItem(key);
        try {
            return JSON.parse(value);
        } catch (e) {
            return null;
        }
    };


    /**
     * Set an item
     *
     * @param {string} key
     * @param value
     */
    set = function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };

    // rexpose public methods
    return {
        get : get,
        set : set
    };
}(window.localStorage));
