"use strict";
/*jslint browser: true, unparam: true */


function pretty_print(obj) {
    // https://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript/4835406#4835406
    function escapeHtml(text) {
      var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };

      return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function unescapeHtml(text) {
      var map = {
          'amp': '&',
          'lt': '<',
          'gt': '>',
          'quot': '"',
          '#039': "'",
      };

      return text.replace(/&(.*?);/g, function(match, entity) { return map[entity] || match; });
    }

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
    }, 2)).replace(/&quot;!!!.*?!!!&quot;/mg, function(match) {
        // De-parse innards and put it in it's own block
        return '<i style="display: inline-block; vertical-align: middle">' +
            escapeHtml(JSON.parse(unescapeHtml(match)).replace(/^!!!|!!!$/g, '')) +
            '</i>';
    });
}


// Add log message as extra PRE element to body
window.tape_server.message = function (msg_class, msg_text, format) {
    var el;

    el = window.document.createElement('PRE');
    if (format === 'html') {
        el.innerHTML = msg_text;
    } else {
        el.innerText = msg_text;
    }
    // TODO: tape-server class, use this to control our stylings
    el.className = Array.isArray(msg_class) ? msg_class.join(' ') : msg_class;
    window.document.body.appendChild(el);
    el.scrollIntoView();
}


// Global errors get redirected always
window.onerror = function (message, source, lineno, colno, err) {
    window.tape_server.message('error', (err || {}).stack ? err.stack : message);
    window.tape_server.message(['final', 'error'], '*** Terminated ***');
};


// Redirect console output to document
window.tape_server.orig_console = {};
['log', 'error', 'warn', 'dir', 'debug', 'info', 'trace'].forEach(function (method) {
    window.tape_server.orig_console[method] = window.console[method] || function () { return; };

    if (!window.tape_server.config['hide-console']) {
        window.console[method] = function (msg) {
            window.tape_server.orig_console[method].apply(this, arguments);
            if (method === 'trace') {
                window.tape_server.message(method, (new Error(msg)).stack.replace('Error: ', ''));
            } else {
                window.tape_server.message(method, pretty_print(msg), 'html');
            }
        };
    }
});
