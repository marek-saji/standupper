window.UI = (function (document, window, undefined) {
    "use strict";

    // methods
    var fatalError,
        redrawEntry,
        init,
        drawDay,
        _drawDay,
        _drawUserEntries,
        _drawSubentries,
        _onEntryChange,
        _onDateChange,
        _setDate,
        _getDate;

    // properties
    var _dayChooser;

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



    fatalError = function () {
        console.error(arguments);
        // TODO better message
        window.alert('get the hell out and die');
    };


    init = function () {
        _dayChooser = document.getElementById('dayChooser');
        _dayChooser.addEventListener("input", _onDateChange, false);

        drawDay(new Date());
    };

    redrawEntry = function (user_id, entry) {
        var list = document.querySelector("#user-" + user_id + " .subentries");
        _drawSubentries(list, entry);
    };

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

    _drawUserEntries = function (entry) {
        var userSection = document.createElement("section"),
            header = document.createElement("h2"),
            avatar = document.createElement("img"),
            list = document.createElement('ol');

        userSection.id = "user-" + entry.user_id;
        userSection.dataset.date = entry.date;
        userSection.classList.add("entry");

        avatar.src = "http://gravatar.com/avatar/"
                   + entry.user_ident
                   + "?s=" + _AVATAR_SIZE
                   // use ident icons for non-registered e-mails
                   + "&d=identicon";
        avatar.width  = _AVATAR_SIZE;
        avatar.height = _AVATAR_SIZE;
        header.appendChild(avatar);

        // hCard microformat
        header.classList.add("hcard");
        avatar.classList.add("photo");
        header.classList.add("fn");

        header.appendChild(document.createTextNode(entry.user));
        userSection.appendChild(header);

        list.classList.add("subentries");
        _drawSubentries(list, entry);
        userSection.appendChild(list);

        document.getElementById("contents").appendChild(userSection);
    };

    drawDay = function (date) {
        _setDate(date);
        now.initializeDay(date, _drawDay, fatalError);
    };

    _drawDay = function (dayEntries) {
        var me = client.getUser(),
            isMyEntry,
            compareEntriesByUser;
        isMyEntry = function (entry) {
            return me._id === entry.user_id;
        };
        compareEntriesByUser = function (entryA, entryB) {
            return entryA.user_id > entryB.user_id;
        };
        if (false === dayEntries.some(isMyEntry))
        {
            dayEntries.push({
                user    : me.name,
                user_id : me._id,
                date    : _getDate()
            });
        }
        dayEntries = dayEntries.sort(compareEntriesByUser);
        document.getElementById("contents").innerHTML = "";
        dayEntries.forEach(_drawUserEntries);
    };


    // TODO don't loose changes, when leaving page
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


    _onDateChange = function (e) {
        // TODO only if different than current date
        drawDay(_getDate());
    };



    _getDate = function () {
        return _dayChooser.value;
    };
    _setDate = function (date) {
        // TODO better way?
        var y, m, d;
        date = new Date(date);
        y = date.getFullYear();
        m = date.getMonth() + 1;
        d = date.getDate();
        _dayChooser.value = y + "-" + (m<10?"0":"") + m + "-" + (d<10?"0":"") + d;
    };


    return {
        init : init,
        redrawEntry : redrawEntry,
        drawDay: drawDay,
        fatalError : fatalError
    };
}(document, window));
