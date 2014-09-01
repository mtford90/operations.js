/**
 * Shim to enable access to underscore library.
 * @returns {*}
 */
function getUnderscore() {
    if (typeof window != 'undefined') {
        return window['_'];
    }
    return null;
}