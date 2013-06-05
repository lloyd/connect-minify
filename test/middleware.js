/* Copyright 2013 Lloyd Hilaiel
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License. */

var minify  = require('../'),
    should   = require('should');

describe('middleware', function() {
  it("should throw when assets argument is missing", function (done) {
    (minify).should.throw("options expected to be an object");
    (function() { minify({}); }).should.throw("assets missing");
    done();
  });
});
