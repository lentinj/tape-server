"use strict";
/*jslint browser: true */

console.log("Hello");

console.log("Falsey values:");
console.log(undefined);
console.log(null);
console.log(false);
console.log(0);
console.log("");

console.log("Truthy values:");
console.log(true);
console.log(1);
console.log("x");

console.log("The following value is an HTML element:");
console.log(new window.Option("Inner Text", "val"));

console.log("Arrays:");
console.log(["1 potato", "2 potato", "3 potato", undefined, 5]);

console.log("Objects:");
console.log({a: "1 potato", b: 33});

function SomeClass(x) {
    this.x = x;
    this.y = x + 2;
}

function multi_line_function(x) {
    x = x + 1;
    x = x + 2;
    return x;
}

var el = document.createElement('DIV');
el.innerHTML = "<p>This is a <b>paragraph</b>.\n</p><p>There's stuff</p>";

console.log("Functions:");
console.log({
    a: function (x) { return x + 2; },
    b: multi_line_function,
    c: new SomeClass(4),
    d: el
});

console.error("error");
console.warn("warn");
console.info("info");
console.debug("debug");
console.dir("dir");
console.trace("trace");
