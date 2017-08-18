const Emitter = require('events');
const debug = require('debug')('analyzers:Organizer');

function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!');
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

function onerror(err) {
  const msg = err.stack || err.toString();
  console.error();
  console.error(msg.replace(/^/gm, '  '));
  console.error();
}

class Organizer extends Emitter {
  constructor() {
    super();
    this.middleware = [];
  }

  /**
   * Use the given middleware `fn`.
   *
   * @param {Function} fn
   * @return {Application} self
   * @api public
   */

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }

  analyze(ctx) {
    const fn = compose(this.middleware);

    // const handleBody = (req, res) => {
    //   const ctx = this.createContext(req, res);
    //   return fn(ctx).then(

    //   ).catch(onerror);
    // };
    // return handleBody;
    return fn(ctx).then().catch(onerror);
  }
}


module.exports = Organizer;
