#!/usr/bin/env node
"use strict";
/*jslint unparam: true, nomen: true*/
var browserify = require('browserify');
var fs = require("fs");
var http = require('http');
var path = require("path");
var url = require('url');

var argv = require('minimist')(process.argv.slice(2), {
    string: ['listen', 'port'],
    boolean: ['help'],
    alias: { h: 'help' },
});

if (argv.help || argv._.length === 0) {
    console.log([
        "Usage:",
        'tape-server',
        "[ --listen=localhost ]",
        "[ --port=8123 ]",
        "(js test file)",
        ". . .",
    ].join(' '));
    return;
}

function string_escape(str) {
    return str.replace(/\\/g, "\\\\")
              .replace(/\$/g, "\\$")
              .replace(/'/g, "\\'")
              .replace(/"/g, "\\\"")
              .replace(/\n/g, "\\n");
}


function serve_file(file_name, content_type, request, response) {
    var file_path = path.join(__dirname, file_name);

    response.writeHead(200, {"Content-Type": content_type});
    fs.createReadStream(file_path).pipe(response);
}


function bundle_js(request, response) {
    var stream, b = browserify({ debug: true });

    b.add(argv._);
    b.transform('brfs');
    response.writeHead(200, {"Content-Type": "application/javascript"});
    stream = b.bundle();
    stream.once("error", function (err) {
        response.write('console.error("Failed to build browserify bundle:");\n');
    });
    stream.on("error", function (err) {
        response.write('console.error("' + string_escape(err.message) + '");\n');
        // NB: "error" gets called on each error, but I can't find an
        // event that we can use to close the response. Cheat for now.
        setTimeout(response.end.bind(response), 100);
    });
    stream.pipe(response);
}


var app = http.createServer(function (request, response) {
    var parsed_url = url.parse(request.url, true);

    if (parsed_url.pathname === "/" || parsed_url.pathname === "") {
        serve_file('index.html', 'text/html', request, response);
    } else if (parsed_url.pathname === "/console.js") {
        serve_file('console.js', 'application/javascript', request, response);
    } else if (parsed_url.pathname === "/bundle.js") {
        bundle_js(request, response);
    } else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("Not found");
        response.end();
    }
});


app.listen(parseInt(argv.port, 10) || 8123, argv.listen || null);
