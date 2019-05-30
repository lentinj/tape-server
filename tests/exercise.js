"use strict";
/*jslint browser: true */
var fs = require('fs');

console.log("Hello");

console.log("The following value is undefined:");
console.log(undefined);

console.log("The following value is an HTML element:");
console.log(new window.Option("Inner Text", "val"));

console.log("Arrays:");
console.log(["1 potato", "2 potato", "3 potato", undefined, 5]);

console.log("Objects:");
console.log({a: "1 potato", b: 33});

console.error("error");
console.warn("warn");
console.info("info");
console.debug("debug");
console.dir("dir");
console.trace("trace");

console.log(fs.readFileSync(__dirname + '/file-content.txt', 'utf8'));
