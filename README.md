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

## License

MIT
