"use strict";
/*jslint browser: true, unparam: true */
var console = window.console || {};

function to_string(obj) {
    if (obj.outerHTML) {
        return obj.outerHTML;
    }
    if (Array.isArray(obj) || (window.NodeList && obj instanceof window.NodeList) || (window.HTMLCollection && obj instanceof window.HTMLCollection)) {
        return obj.constructor.name + ': ' + JSON.stringify(Array.prototype.map.call(obj, to_string), null, 2);
    }
    if (typeof obj === 'object') {
        return JSON.stringify(obj, null, 2);
    }
    return obj.toString();
}

function add_message(msg_class, msg_text) {
    var el;

    el = document.createElement('PRE');
    el.innerText = to_string(msg_text);
    el.className = msg_class;
    document.body.appendChild(el);
}

['log', 'error', 'warn', 'dir', 'debug', 'info', 'trace'].forEach(function (method) {
    var old_method = console[method] || function () { return; };

    console[method] = function (msg) {
        old_method.apply(this, arguments);
        if (method === 'trace') {
            add_message(method, (new Error(msg)).stack.replace('Error: ', ''));
        } else {
            add_message(method, msg);
        }
    };
});

window.onerror = function (message, source, lineno, colno, err) {
    add_message('error', (err || {}).stack ? err.stack : message);
    add_message('error', '*** Terminated ***');
};
