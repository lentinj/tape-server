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


var re_fmt_specifier = /(%[\-\+ #0-9\*.]*[osdfc])/i;

/**
  * Return HTML rendering of what console.log() would do with input
  */
function logprintf(first_obj) {
    var format_string, items = Array.prototype.slice.call(arguments), closer = "";

    function last_char(s) { return s.charAt(s.length - 1); }

    items.reverse();
    if (typeof first_obj === 'string' && first_obj.match(re_fmt_specifier)) {
        // First item is a string with formatting instructions, use those
        format_string = items.pop();
    } else {
        // Otherwise make our own from the arguments
        format_string = Array.prototype.map.call(arguments, function (a) {
            return typeof a === 'string' ? '%s' : '%o';
        }).join("\n");
    }

    return format_string.split(re_fmt_specifier).map(function (part, i) {
        var val;

        if (i % 2 === 0) {  // String in-between formatting
            return escapeHtml(part);
        }
        if (part === '%s') {  // %s: String
            return escapeHtml(items.pop());
        }
        if (part === '%o') {  // %o: Object
            val = items.pop();
            try {
                return pretty_print(val);
            } catch (e) {
                // Fall back to JSON rather than breaking entirely
                return JSON.stringify(val, null, 2);
            }
        }
        if (part === '%c') {  // %c: CSS formatting instructions
            // Close any existing spans before carrying on
            val = closer;
            closer = '</span>';
            return val + '<span style="' + escapeHtml(items.pop()) + '">';
        }
        if (last_char(part) === 'd' || last_char(part) === 'f') { // %d / %f: Decimal / floating-point output
            val = items.pop();
            if (isNaN(Number(val))) {
                return NaN;
            }
            if (last_char(part) === 'd') {
                return Math.floor(val);
            }
            return val;
        }

        // Don't know how to deal with it, assume it's not a formatting instruction
        // NB: We don't pop anything off items either
        return escapeHtml(part);
    }).join("") + closer;
}
module.exports.logprintf = logprintf;
