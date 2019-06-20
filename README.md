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

## Reading files

[brfs](https://www.npmjs.com/package/brfs) included in the browserify chain that
tape-server uses, so you can use the following to read files alongside your
tests:

    fs.readFileSync(__dirname + '/file-content.txt', 'utf8')

Note that brfs includes files at compilation time, so any file reference cannot
include any other variable than the ones it explicitly knows about, see
documentation.

## License

MIT
