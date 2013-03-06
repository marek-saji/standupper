/**
 * Unprefix some objects and methods.
 */
(function (window, undefined) {

    var vendors = ["webkit", "moz", "ms", "o"],
        i;

    /**
     * NotificationCenter
     */

    for (i = 0 ; ! window.notifications && i < vendors.length ; i++) {
        window.notifications = window[vendors[i] + 'Notifications'];
    }
    if (! window.notifications) {
        window.notifications = {
            requestPermissions : function (f) { f(); },
            // warning! this simulates webkit's implementation, not W3C draft
            checkPermissions   : function () { return 0; },
            createNotification : function () { return {
                show : function () {
                    if (this.onerror) {
                        this.onerror();
                    }
                }
            };}
        };
    }


}(window));
