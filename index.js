/* Copyright 2013 Lloyd Hilaiel
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. */

var fs = require('fs'),
path = require('path'),
util = require('util'),
_ = require('underscore'),
crypto = require('crypto'),
computecluster = require('compute-cluster');

var compressor = new computecluster({
  module: path.join(__dirname, 'compressor.js'),
  max_backlog: -1
});

// synchronous check for the existence of assets
function syncAssetCheck(opts) {
  // check root path
  if (typeof opts.root !== 'string') {
    throw new Error(util.format("root path malformed (expected a string)"));
  } else if (!fs.existsSync(opts.root)) {
    throw new Error(util.format("root path does not exist: %s", opts.root));
  }

  Object.keys(opts.assets).forEach(function(k) {
    // allow assets composed of a single file to be specified
    // as strings
    if (typeof opts.assets[k] === 'string') {
      opts.assets[k] = [ opts.assets[k] ];
    }
    // verify the existence of each file
    opts.assets[k].forEach(function(v) {
      if (typeof v !== 'string') {
        throw new Error(util.format("'%s' has malformed asset list", k));
      }
      if (!fs.existsSync(path.join(opts.root, v))) {
        throw new Error(util.format("'%s' file does not exist", v));
      }
    });
  });
}

function cacheUpdate(opts, done) {
  var cache = {};

  // for each key, let's read all files associated with the key
  Object.keys(opts.assets).forEach(function(k) {
    var arr = opts.assets[k].slice(0);
    var source = "";
    function next() {
      if (arr.length === 0) {
        var md5 = crypto.createHash('md5');
        md5.update(source);
        var hash = md5.digest('hex').slice(0, 10);

        cache[k] = {
          source: source,
          hash: hash
        };

        if (Object.keys(cache).length === Object.keys(opts.assets).length) {
          done(cache);
        }
        return;
      }
      var f = path.join(opts.root, arr.shift());
      fs.readFile(f, function(err, contents) {
        if (err) {
          console.error("can't read:", f, err);
          process.exit(1);
        }
        if (source.length) source += "\n";
        source += contents;
        next();
      });
    }
    next();
  });

}

module.exports = function(opts) {
  opts = _.clone(opts);
  if (typeof opts !== 'object') {
    throw new Error("options argument to minify expected to be an object");
  } else if (!opts.hasOwnProperty('assets')) {
    throw new Error("assets argument to minify missing");
  } else if (typeof opts.assets !== 'object' || opts.assets === null) {
    throw new Error("assets argument to minify must be an object");
  }
  if (!opts.root) opts.root = process.cwd();
  if (!opts.prefix) opts.prefix = '/';

  syncAssetCheck(opts);

  var cache = null;
  var waiting = null;

  var minifiedURL = function(url) {
    if (!cache[url]) throw new Error(util.format("cannot minify url '%s'"));
    return util.format('%s%s%s', opts.prefix, cache[url].hash, url);
  };

  // update the cache, upon completion will wake up all requests on the waiting queue
  function startCacheUpdate() {
    cacheUpdate(opts, function(theCache) {
      cache = theCache;
      waiting.forEach(function(f) { f(); });
      waiting = null;
    });
  }

  return function(req, res, next) {
    var handleRequest = function() {
      if (cache[req.url]) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        // must we minify?
        if (!cache[req.url].minfied) {
          // XXX: don't compress multiple times when simultaneous requests
          // come in
          compressor.enqueue({
            name: req.url,
            content: cache[req.url].source
          }, function (err, r) {
            if (err) return res.send(500, "failed to generate resource");
            delete cache[req.url].source;
            cache[req.url].minified = r.content;
            res.send(200, cache[req.url].minified);
          });
        } else {
          res.send(200, cache[req.url].minified);
        }
      } else {
        res.minifiedURL = res.locals.minifiedURL = minifiedURL;
        next();
      }
    };

    // lazy cache population
    if (!cache) {
      if (!waiting) {
        waiting = [ handleRequest ];
        startCacheUpdate();
      } else {
        waiting.push(handleRequest);
      }
    } else {
      handleRequest();
    }
  };
};
