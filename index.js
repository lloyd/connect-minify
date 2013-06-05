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
util = require('util');

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

module.exports = function(opts) {
  if (typeof opts !== 'object') {
    throw new Error("options argument to minify expected to be an object");
  } else if (!opts.hasOwnProperty('assets')) {
    throw new Error("assets argument to minify missing");
  } else if (typeof opts.assets !== 'object' || opts.assets === null) {
    throw new Error("assets argument to minify must be an object");
  }
  if (!opts.root) opts.root = process.cwd();

  syncAssetCheck(opts);

  return function(req, res, next) {
    next();
  };
};
