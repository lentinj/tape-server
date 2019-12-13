"use strict";
/*jslint browser: true, unparam: true */
var test = require('tape');
var logprintf = require('./pretty_print.js').logprintf;

function DomConsole(container_el) {
    this.container_el = container_el;
    this.init_container = container_el;
    this.orig_console = {};
}
DomConsole.prototype.output = function (log_level, log_arguments) {
    var el;

    // Add log message as extra PRE element to body
    el = window.document.createElement('PRE');
    el.innerHTML = logprintf.apply(null, log_arguments);
    el.className = 'dom-console-msg ' + log_level;
    this.container_el.appendChild(el);
    el.scrollIntoView();
    return el;
};
DomConsole.prototype.log = function (first_obj) { return this.output('log', arguments); };
DomConsole.prototype.error = function (first_obj) { return this.output('error', arguments); };
DomConsole.prototype.warn = function (first_obj) { return this.output('warn', arguments); };
DomConsole.prototype.dir = function (first_obj) { return this.output('dir', arguments); };
DomConsole.prototype.debug = function (first_obj) { return this.output('debug', arguments); };
DomConsole.prototype.info = function (first_obj) { return this.output('info', arguments); };
DomConsole.prototype.trace = function (msg) {
    this.log((new Error(msg || '')).stack.replace('Error: ', ''));
};
DomConsole.prototype.group = function (msg) {
    this.container_el = this.output('log', [msg]);
};
DomConsole.prototype.groupEnd = function (msg) {
    this.container_el = this.init_container;
};
DomConsole.prototype.redirect = function () {
    ['log', 'error', 'warn', 'dir', 'debug', 'info', 'trace', 'group', 'groupEnd'].forEach(function (method) {
        this.orig_console[method] = window.console[method] || function () { return; };
        window.console[method] = function () {
            this.orig_console[method].apply(window.console, arguments);
            this[method].apply(this, arguments);
        }.bind(this);
    }.bind(this));

    // Replacement for console's uncaught error
    window.onerror = function (message, source, lineno, colno, err) {
        this.error("%c*** Uncaught error ***\n%s", [
            "font-size: 105%",
        ].join(";"), (err || {}).stack ? err.stack : message);
    }.bind(this);
};

// Redirect console output to document
if (!window.tape_server.config['hide-console']) {
    window.tape_server.dom_console = new DomConsole(window.document.body);
    window.tape_server.dom_console.redirect();
}

// Before any tests run, reconfigure tape with coloured output
test.createStream({ objectMode: false }).on('data', function (x) {
    if (x.match(/^# (?!(tests|pass)\s+\d+\n)/)) {
        console.groupEnd();
        console.group(x);
        return;
    }
    if (x.match(/^\n/)) {
        console.groupEnd();
    }
    console.log('%c' + x.trim(), [
        "font-weight: bold",
        "font-size: 105%",
        "color: " + (x.match(/^ok /) ? 'green' : x.match(/^not ok /) ? 'red' : 'black'),
    ].join("; "));
}).on('end', function (x) {
    console.groupEnd();
    console.log('%c*** Finished ***', [
        "font-weight: bold",
        "font-size: 105%",
        "color: green",
    ].join("; "));
});
