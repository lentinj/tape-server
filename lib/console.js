"use strict";
/*jslint browser: true, unparam: true */
var test = require('tape');
var pretty_print = require('./pretty_print.js').pretty_print;


// Add log message as extra PRE element to body
window.tape_server.message = function (msg_class, msg_text, format) {
    var el;

    el = window.document.createElement('PRE');
    if (format === 'html') {
        el.innerHTML = msg_text;
    } else {
        el.innerText = msg_text;
    }
    el.className = 'tape-server-msg ' + (Array.isArray(msg_class) ? msg_class.join(' ') : msg_class);
    window.document.body.appendChild(el);
    el.scrollIntoView();
};


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


// Before any tests run, reconfigure tape to redirect line output
test.createStream({ objectMode: false }).on('data', function (x) {
    var extra_class = x.match(/^ok /) ? 'success' : x.match(/^not ok /) ? 'error' : '';

    if (!window.tape_server.config['hide-tap']) {
        window.tape_server.message(['tap', extra_class], x);
    }
    window.tape_server.orig_console.log('%c' + x.trim(), [
        "font-weight: bold",
        "font-size: 105%",
        "color: " + (extra_class === 'success' ? 'green' : extra_class === 'error' ? 'red' : 'black'),
    ].join("; "));
}).on('end', function (x) {
    window.tape_server.message(['final', 'success'], '*** Finished ***');
});
