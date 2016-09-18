const container = require('@xudong/container');
const createError = require('http-errors');
const httpAssert = require('http-assert');
const statuses = require('statuses');
const accepts = require('accepts');
const Cookies = require('cookies');

container.set('assert', function () {
  return httpAssert;
});

container.set('throw', function () {
  return () => {
    throw createError.apply(null, arguments);
  };
});

container.set('onerror', function () {
  return (err) => {
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (null == err) return;

    if (!(err instanceof Error)) err = new Error(`non-error thrown: ${err}`);

    // delegate
    this.app.emit('error', err, this);

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (this.headerSent || !this.writable) {
      err.headerSent = true;
      return;
    }

    // unset all headers, and set those specified
    this.res._headers = {};
    this.set(err.headers);

    // force text/plain
    this.type = 'text';

    // ENOENT support
    if ('ENOENT' == err.code) err.status = 404;

    // default to 500
    if ('number' != typeof err.status || !statuses[err.status]) err.status = 500;

    // respond
    const code = statuses[err.status];
    const msg = err.expose ? err.message : code;
    this.status = err.status;
    this.length = Buffer.byteLength(msg);
    this.res.end(msg);
  };
});

/**
 * Response Alias
 */
container.alias('attachment', 'response.attachment');
container.alias('redirect', 'response.redirect');
container.alias('remove', 'response.remove');
container.alias('vary', 'response.vary');
container.alias('set', 'response.set');
container.alias('append', 'response.append');
container.alias('flushHeaders', 'response.flushHeaders');
container.alias('status', 'response.status');
container.alias('message', 'response.message');
container.alias('body', 'response.body');
container.alias('length', 'response.length');
container.alias('type', 'response.type');
container.alias('lastModified', 'response.lastModified');
container.alias('etag', 'response.etag');
container.alias('headerSent', 'response.headerSent');
container.alias('writable', 'response.writable');

/**
 * Request Alias
 */
container.alias('acceptsLanguages', 'request.acceptsLanguages');
container.alias('acceptsEncodings', 'request.acceptsEncodings');
container.alias('acceptsCharsets', 'request.acceptsCharsets');
container.alias('accepts', 'request.accepts');
container.alias('get', 'request.get');
container.alias('is', 'request.is');
container.alias('querystring', 'request.querystring');
container.alias('idempotent', 'request.idempotent');
container.alias('socket', 'request.socket');
container.alias('search', 'request.search');
container.alias('method', 'request.method');
container.alias('query', 'request.query');
container.alias('path', 'request.path');
container.alias('url', 'request.url');
container.alias('origin', 'request.origin');
container.alias('href', 'request.href');
container.alias('subdomains', 'request.subdomains');
container.alias('protocol', 'request.protocol');
container.alias('host', 'request.host');
container.alias('hostname', 'request.hostname');
container.alias('header', 'request.header');
container.alias('headers', 'request.headers');
container.alias('secure', 'request.secure');
container.alias('stale', 'request.stale');
container.alias('fresh', 'request.fresh');
container.alias('ips', 'request.ips');
container.alias('ip', 'request.ip');

module.exports = function (app) {
  app.createContext = function (req, res) {
    const context = container.clone();
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.onerror = context.onerror.bind(context);
    context.originalUrl = request.originalUrl = req.url;
    context.cookies = new Cookies(req, res, {
      keys: this.keys,
      secure: request.secure
    });
    context.accept = request.accept = accepts(req);
    context.state = {};

    context.body = function (response) {
      return response.body;
    };
    return context;
  }
};