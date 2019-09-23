"use strict";
/*jslint browser: true */
var test = require('tape');

if (!global.window) {
    global.window = {};
}

var pretty_print = require('lib/pretty_print.js').pretty_print;

test('pretty_print', function (t) {
    t.equal(pretty_print(undefined), [
        '<i style="display: inline-block; vertical-align: middle">undefined</i>'
    ].join("\n"), "Undefined");
    t.equal(pretty_print(null), [
        '<i style="display: inline-block; vertical-align: middle">null</i>'
    ].join("\n"), "null");
    t.equal(pretty_print(false), [
        '<i style="display: inline-block; vertical-align: middle">false</i>'
    ].join("\n"), "false");
    t.equal(pretty_print(true), [
        '<i style="display: inline-block; vertical-align: middle">true</i>'
    ].join("\n"), "true");
    t.equal(pretty_print(42), [
        '42',
    ].join("\n"), "42");

    t.equal(pretty_print("String with <b>Inline HTML</b>"), [
        'String with &lt;b&gt;Inline HTML&lt;/b&gt;',
    ].join("\n"), "String with <b>Inline HTML</b> (gets escaped)");

    t.equal(pretty_print([undefined, null, false, ""]), [
        '[',
        '  <i style="display: inline-block; vertical-align: middle">undefined</i>,',
        '  <i style="display: inline-block; vertical-align: middle">null</i>,',
        '  <i style="display: inline-block; vertical-align: middle">false</i>,',
        '  &quot;&quot;',
        ']',
    ].join("\n"), "Array of falsey things (undefined/null/false as literals, string quotes escaped)");

    t.equal(pretty_print([1, "x\ny\nz", 3]), [
        "[",
        "  1,",
        "  &quot;x\\ny\\nz&quot;,",
        "  3",
        "]"
    ].join("\n"), "Arrays get pretty-printed");

    function some_function(x) {
        x = x + 1;
        return x;
    }
    t.equal(pretty_print({fn: some_function}), [
        '{',
        '  &quot;fn&quot;: <i style="display: inline-block; vertical-align: middle">function some_function(x) {',
        '        x = x + 1;',
        '        return x;',
        '    }</i>',
        '}',
    ].join("\n"), "Function in object has it's source show in an inline-block");

    t.end();
});

test('pretty_print:NodeList', function (t) {
    var el;

    if (!window.NodeList) {
        t.skip("NodeList not available");
        t.end();
        return;
    }

    el = document.createElement('UL');
    el.innerHTML = [
        '<li>Item <i>1</i></li>',
        '<li>Item <i>2</i></li>',
        '<li>Item <i>3</i></li>',
    ].join("");
    t.equal(pretty_print(el.childNodes), [
        '[',
        '  <i style="display: inline-block; vertical-align: middle">&lt;li&gt;Item &lt;i&gt;1&lt;/i&gt;&lt;/li&gt;</i>,',
        '  <i style="display: inline-block; vertical-align: middle">&lt;li&gt;Item &lt;i&gt;2&lt;/i&gt;&lt;/li&gt;</i>,',
        '  <i style="display: inline-block; vertical-align: middle">&lt;li&gt;Item &lt;i&gt;3&lt;/i&gt;&lt;/li&gt;</i>',
        ']',
    ].join("\n"), "Nodelist printed like an array");

    t.end();
});

test('pretty_print:HTMLCollection', function (t) {
    var el;

    if (!window.HTMLCollection) {
        t.skip("HTMLCollection not available");
        t.end();
        return;
    }

    el = document.createElement('FORM');
    el.innerHTML = [
        '<input name="alfred" value="x" />',
        '<input name="daisy" value="x" />',
        '<input name="frank" value="x" />',
        '<input name="gelda" value="x" />',
    ].join("");
    t.equal(pretty_print(el.childNodes), [
        '[',
        '  <i style="display: inline-block; vertical-align: middle">&lt;input name=&quot;alfred&quot; value=&quot;x&quot;&gt;</i>,',
        '  <i style="display: inline-block; vertical-align: middle">&lt;input name=&quot;daisy&quot; value=&quot;x&quot;&gt;</i>,',
        '  <i style="display: inline-block; vertical-align: middle">&lt;input name=&quot;frank&quot; value=&quot;x&quot;&gt;</i>,',
        '  <i style="display: inline-block; vertical-align: middle">&lt;input name=&quot;gelda&quot; value=&quot;x&quot;&gt;</i>',
        ']',
    ].join("\n"), "HTMLCollection printed like an array");

    t.end();
});
