"use strict";
/*jslint browser: true, regexp: true, unparam: true */

// https://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript/4835406#4835406
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}


function unescapeHtml(text) {
    var map = {
        'amp': '&',
        'lt': '<',
        'gt': '>',
        'quot': '"',
        '#039': "'",
    };

    return text.replace(/&(.*?);/g, function (match, entity) { return map[entity] || match; });
}


function pretty_print(obj) {
    function literal(x) {
        return '!!!' + x + '!!!';
    }

    // If entire object is a string, just return it
    if (typeof obj === 'string') {
        return escapeHtml(obj);
    }

    return escapeHtml(JSON.stringify(obj, function (k, v) {
        if (v === undefined) {
            return literal('undefined');
        }
        if (v === null) {
            return literal('null');
        }
        if (v === false) {
            return literal('false');
        }
        if (v === true) {
            return literal('true');
        }

        if (v.outerHTML) {
            // Elements should be shown as their HTML
            return literal(v.outerHTML);
        }

        if ((window.NodeList && v instanceof window.NodeList) ||
                (window.HTMLCollection && v instanceof window.HTMLCollection)) {
            // Turn it into a proper array for pretty-printing
            return Array.prototype.slice.call(v);
        }

        if (JSON.stringify(v) === undefined && v.toString) {
            // Stringify things that JSON won't handle on it's own, e.g. functions
            return literal(v.toString());
        }

        return v;
    }, 2)).replace(/&quot;!!!.*?!!!&quot;/mg, function (match) {
        // De-parse innards and put it in it's own block
        return '<i style="display: inline-block; vertical-align: middle">' +
            escapeHtml(JSON.parse(unescapeHtml(match)).replace(/^!!!|!!!$/g, '')) +
            '</i>';
    });
}
module.exports.pretty_print = pretty_print;
