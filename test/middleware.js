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


var
minify = require('..'),
should = require('should'),
path = require('path');

describe('middleware', function() {
  it("throws when assets argument is missing", function (done) {
    (minify).should.throw("options argument to minify expected to be an object");
    (function() { minify({}); }).should.throw("assets argument to minify missing");
    done();
  });

  it("throws when source assets do not exist", function (done) {
    (function() {
      minify({
        assets: {
          "minified.js": "source.js"
        }
      });
    }).should.throw("'source.js' file does not exist");
    done();
  });

  it("throws when assets argument is poorly formed", function (done) {
    (function() {
      minify({ assets: { "minified.js": [ { "source.js": "bogus" } ] } });
    }).should.throw("'minified.js' has malformed asset list");

    (function() {
      minify({ assets: null });
    }).should.throw("assets argument to minify must be an object");
    done();
  });

  it("throws when root argument is poorly formed", function (done) {
    (function() {
      minify({
        assets: { "minified.js": "source.js" },
        root: [ "not", "a", "valid", "root" ]
      });
    }).should.throw("root path malformed (expected a string)");

    (function() {
      minify({
        assets: { "minified.js": "source.js" },
        root: "does_not_exist"
      });
    }).should.throw("root path does not exist: does_not_exist");

    done();
  });

  it("adds expected functions to the request", function (done) {
    var middleWare = minify({
      assets: {
        "minified.js": "source.js"
      },
      root: path.join(__dirname, 'test_assets')
    });

    var req = {
      url: 'does_not_exist',
      locals: require('express/lib/utils.js').locals({})
    };
    middleWare(req, { }, function() {
      req.minifiedURL.should.be.a('function');
      req.locals.minifiedURL.should.be.a('function');
    });
    done();
  });


});
