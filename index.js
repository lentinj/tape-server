#!/usr/bin/env node
"use strict";
/*jslint unparam: true, nomen: true*/
var browserify = require('browserify');
var fs = require("fs");
var http = require('http');
var path = require("path");
var url = require('url');

var argv = require('minimist')(process.argv.slice(2));


function string_escape(str) {
    return str.replace(/\\/g, "\\\\")
              .replace(/\$/g, "\\$")
              .replace(/'/g, "\\'")
              .replace(/"/g, "\\\"")
              .replace(/\n/g, "\\n");
}


function index_html(request, response) {
    var file_path = path.join(__dirname, 'index.html');

    response.writeHead(200, {"Content-Type": "text/html"});
    fs.createReadStream(file_path).pipe(response);
}


function bundle_js(request, response) {
    var stream, b = browserify({ debug: true });

    b.add(argv._);
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

    if (parsed_url.pathname === "/") {
        index_html(request, response);
    } else if (parsed_url.pathname === "/bundle.js") {
        bundle_js(request, response);
    } else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("Not found");
        response.end();
    }
});


app.listen(parseInt(argv.port, 10) || 8123);
