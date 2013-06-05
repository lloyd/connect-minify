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

// syntax checking of the source

const
should = require('should'),
fs = require('fs'),
path = require('path'),
jshint = require('jshint').JSHINT,
walk = require('walk'),
util = require('util');

describe('source code syntax', function() {
  // read jshintrc
  var jshintrc;

  it('.jshintrc should be readable', function(done) {
    jshintrc = JSON.parse(fs.readFileSync(path.join(__dirname, '../.jshintrc')).toString());
    (jshintrc).should.be.a('object');
    done();
  });

  var filesToLint = [
    path.join(__dirname, '../index.js'),
    path.join(__dirname, '../compressor.js')
  ];

  it('we should be able to discover files to lint', function(done) {
    var walker = walk.walkSync(path.join(__dirname, '../test'), {});

    walker.on("file", function(root, fStat, next) {
      var f = path.join(root, fStat.name);
      if (/\.js$/.test(f)) {
        filesToLint.push(f);
      }
      next();
    });
    walker.on("end", done);
  });

  it('syntax checking should yield no errors', function(done) {
    var errors = [];

    function checkNext() {
      if (!filesToLint.length) {
        if (errors.length) {
          var buf = util.format("\n        %d errors:\n        * ",
                                errors.length);
          buf += errors.join("\n        * ");
          done(buf);
        } else {
          done(null);
        }
        return;
      }
      var f = filesToLint.shift();
      fs.readFile(f.toString(), function(err, data) {
        // now
        f = path.relative(process.cwd(), f);
        if (!jshint(data.toString(), jshintrc)) {
          jshint.errors.forEach(function(e) {
            errors.push(util.format("%s %s:%d - %s", e.id, f, e.line, e.reason));
          });
        }
        checkNext();
      });
    }
    checkNext();
  });
});
