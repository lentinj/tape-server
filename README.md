# tape-server

NodeJS server that will build/run tape tests in a browser

Similar to [tape-run](https://github.com/juliangruber/tape-run) but doesn't expect a local browser or drag in electron,
instead you load the page in an existing browser window to run tests.

## Usage

e.g. in ``package.json``:

```
"scripts": {
    "test-browser": "tape-server --port=8123 tests/test_*.js"
}
```

Then run ``npm run test-browser`` and visit ``http://localhost:8123``.
Tests will be re-bundled and re-run in the browser on each page load.

## Browser-only tests

Write tests exactly as you would with tape. Presumably if using this module you
are writing tests that only work with a browser. In that case it is useful to
skip over the test unless you are in a browser environment with the following:

```
var test = require('tape');

test('testing_a_thing', function (t) {
    if (!global.document) {
        t.skip("This test requires a browser");
        t.end();
        return;
    }

    . . . your test . . .

}
```

By default, both tape TAP output and any ``console.log()`` messages will be
written to both the Javascript console and the document body.

It doesn't seem to be possible to fully replicate the javascript console's
output in the main page, in particular the sourcemap won't be resolved in
tracebacks, and the source of any HTML elements will be displayed, rather than
an interactive view. It's a useful enough approximation though.

## Command-line options

* ``--hide-console`` will stop writing ``console.log()`` and TAP output to the main page, but will still be visible in the javascript console.

## Adding transforms

Transforms can be added to the browserify chain used, e.g. [brfs](https://www.npmjs.com/package/brfs),
by adding the following to your ``package.json``:

    "browserify": {
        "tape-server-transform": "brfs"
    },

## License

MIT
