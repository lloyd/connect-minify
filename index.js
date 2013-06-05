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
  Object.keys(opts.assets).forEach(function(k) {
    // allow assets composed of a single file to be specified 
    // as strings
    if (typeof opts.assets[k] === 'string') {
      opts.assets[k] = [ opts.assets[k] ];
    }
    // verify the existence of each file
    opts.assets[k].forEach(function(v) {
      if (!fs.existsSync(path.join(opts.root, v))) {
        throw new Error(util.format("'%s' missing", v));
      }
    });
  });
}

module.exports = function(opts) {
  if (typeof opts !== 'object') {
    throw new Error("options argument to minify expected to be an object");
  } else if (typeof opts.assets !== 'object') {
    throw new Error("assets missing from options to minify");
  }
  if (!opts.root) opts.root = process.cwd();

  syncAssetCheck(opts);

  return function(req, res, next) {
    next();
  };
};
