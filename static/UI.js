/**
 * User interface
 */
window.UI = (function (document, window, undefined) {
    "use strict";

    // methods
    var fatalError,
        drawEntry,
        init,
        setTitle,
        drawDay,
        _drawDay,
        _buildUserEntries,
        _drawUserEntries,
        _addUser,
        _drawSubentries,
        _onEntryChange,
        _onDateChange,
        _compareEntriesByUser,
        _setDate,
        _getDate;

    // properties
    var _dayChooser,
        _title;

    // constants
    // sub-entries of a stand entry. `class : title`
    var _ENTRYSUBS = {
        prev      : "Previously",
        next      : "Nextly",
        obstacles : "Obstacles"
    };
    // Responsiveness for network operations.
    var _RESPONSIVENESS = 200;
    // Size of avatar (in px), may be scaled in CSS
    var _AVATAR_SIZE = 100;



    /**
     * Fatal error making further work impossible.
     */
    fatalError = function () {
        console.error.apply(console, arguments);
        console.trace();
        // TODO better message
        window.alert('get the hell out and die');
    };


    /**
     * Initialize user interface
     */
    init = function () {
        if (undefined === _title) {
            _title = document.title;
        }

        _dayChooser = document.getElementById('dayChooser');
        _dayChooser.addEventListener("input", _onDateChange, false);

        drawDay(new Date());
    };


    /**
     * Set page title
     *
     * @param {string} title
     */
    setTitle = function (title) {
        document.title = title + ' ☆ ' + _title;
    };


    /**
     * Draw user entries
     *
     * @param {Object} entry
     */
    drawEntry = function (entry) {
        var list = document.querySelector("#user-" + entry.user_id + " .subentries");
        if (null === list) {
            _addUser(entry);
        }
        else {
            _drawSubentries(list, entry);
        }
    };


    /**
     * Add new user to page
     *
     * @param {Object} entry
     */
    _addUser = function (entry) {
        var newHtmlEntry = _buildUserEntries(entry),
            inserted = false,
            context,
            existingHtmlEntries,
            i;

        context = document.getElementById("contents");
        existingHtmlEntries = context.children;
        for (i=0 ; i < existingHtmlEntries.length ; i++) {
            if (_compareEntriesByUser(existingHtmlEntries[i], newHtmlEntry)) {
                context.insertBefore(newHtmlEntry, existingHtmlEntries[i]);
                inserted = true;
            }
        }
        if (false === inserted) {
            context.appendChild(newHtmlEntry);
        }

        console.log(newHtmlEntry);
    };


    /**
     * Draw subentries in a list
     *
     * @param {HTMLElement} list
     * @param {Object} entry
     */
    _drawSubentries = function (list, entry) {
        var me = client.getUser(),
            ident, // sub-entry ident
            listItem,
            text;

        list.innerHTML = "";
        for (ident in _ENTRYSUBS) {
            if (_ENTRYSUBS.hasOwnProperty(ident)) {
                listItem = document.createElement("li");
                listItem.appendChild(document.createTextNode(_ENTRYSUBS[ident]));
                listItem.classList.add(ident);

                text = document.createElement("textarea");
                text.dataset.user_id = entry.user_id;
                text.value = entry[ident] || "";
                if (entry.user_id !== me._id) {
                    text.readOnly = true;
                }
                listItem.appendChild(text);
                text.addEventListener("input", _onEntryChange, false);

                list.appendChild(listItem);
            }
        }
    };


    /**
     * Draw all user's entries in a day
     *
     * @param {Object} entry
     */
    _buildUserEntries = function (entry) {
        var userSection = document.createElement("section"),
            header = document.createElement("h2"),
            avatar = document.createElement("img"),
            list = document.createElement('ol');

        userSection.id = "user-" + entry.user_id;
        userSection.dataset.user_id = entry.user_id;
        userSection.dataset.date = entry.date;
        userSection.classList.add("entry");

        // hCard microformat
        header.classList.add("hcard");
        avatar.classList.add("photo");
        header.classList.add("fn");

        header.appendChild(document.createTextNode(entry.user));
        userSection.appendChild(header);

        list.classList.add("subentries");
        _drawSubentries(list, entry);
        userSection.appendChild(list);

        return userSection;
    };


    /**
     * Draw all user's entries in a day
     *
     * @param {Object} entry
     */
    _drawUserEntries = function (entry) {
        document.getElementById("contents").appendChild(_buildUserEntries(entry));
    };


    /**
     * Fetch and display given day
     *
     * @param {Date|string} date
     */
    drawDay = function (date) {
        _setDate(date);
        setTitle(_getDate());
        now.initializeDay(date, _drawDay, fatalError);
    };


    /**
     * Draw a day
     *
     * @param {Object} dayEntries User's entries.
     */
    _drawDay = function (dayEntries) {
        var me = client.getUser(),
            isMyEntry,
            compareEntriesByUser;
        isMyEntry = function (entry) {
            return me._id === entry.user_id;
        };
        if (false === dayEntries.some(isMyEntry))
        {
            dayEntries.push({
                user    : me.name,
                user_id : me._id,
                date    : _getDate()
            });
        }
        dayEntries = dayEntries.sort(_compareEntriesByUser);
        document.getElementById("contents").innerHTML = "";
        dayEntries.forEach(_drawUserEntries);
    };


    /**
     * Event called, when entry is being changed
     *
     * @todo Don't loose changes, when leaving page.
     *
     * @param {Event} e
     */
    _onEntryChange = function (e) {
        var target = e.target;
        if (this.dataset.sendDataTimeout) {
            window.clearTimeout(this.dataset.sendDataTimeout);
        }
        this.dataset.sendDataTimeout = window.setTimeout(
            function () {
                var userId = target.dataset.user_id,
                    context = document.getElementById("user-" + userId),
                    entry;

                // TODO use proper user
                entry = {
                    prev      : context.querySelector(".prev textarea").value,
                    next      : context.querySelector(".next textarea").value,
                    obstacles : context.querySelector(".obstacles textarea").value
                };

                now.storeEntry(
                    context.dataset.date,
                    entry,
                    function () {},
                    fatalError
                );
            },
            _RESPONSIVENESS
        );
    };


    /**
     * Event called, when date is being changed.
     *
     * @todo Don't redraw, when date did not change.
     *
     * @param {Event} e
     */
    _onDateChange = function (e) {
        drawDay(_getDate());
    };


    /**
     * Compare two entries by their user.
     *
     * Used for sorting.
     *
     * @param {Object|HTMLElement} entryA
     * @param {Object|HTMLElement} entryB
     *
     * @returns {boolean} `true`, if first entry is greater.
     */
    _compareEntriesByUser = function (entryA, entryB) {
        if (entryA instanceof HTMLElement) {
            entryA = entryA.dataset;
        }
        if (entryB instanceof HTMLElement) {
            entryB = entryB.dataset;
        }
        return entryA.user_id > entryB.user_id;
    };


    /**
     * Get currently displayed date.
     *
     * @returns {String}
     */
    _getDate = function () {
        return _dayChooser.value;
    };


    /**
     * Set currently displayed date.
     *
     * @param {String} date
     */
    _setDate = function (date) {
        // TODO better way?
        var y, m, d, dateF;
        date = new Date(date);
        y = date.getFullYear();
        m = date.getMonth() + 1;
        d = date.getDate();
        dateF = y + "-" + (m<10?"0":"") + m + "-" + (d<10?"0":"") + d;
        _dayChooser.value = dateF;
    };


    // expose public methods
    return {
        init : init,
        drawEntry : drawEntry,
        drawDay: drawDay,
        fatalError : fatalError,
        setTitle : setTitle
    };
}(document, window));
