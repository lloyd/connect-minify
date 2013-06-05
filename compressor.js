const
jsp = require("uglify-js").parser,
pro = require("uglify-js").uglify,
uglifycss = require('uglifycss'),
path = require('path');

function compressResource(name, orig_code, cb) {
  function extract_copyright(code) {
    var tok = jsp.tokenizer(code), toks, ret = "";
    toks = tok().comments_before;

    if (toks.length >= 1) {
      var c = toks[0];
      // copyrights that we'll include MUST be before code body and have
      // the form: /** */
      if (c.value.substr(0, 1) === '*' && c.type === 'comment2') {
        ret += "/*" + c.value + "*/";
      }
    }

    return ret;
  }

  function compress() {
    try {
      var final_code;
      if (/\.js$/.test(name)) {
        // extract copyright
        var copyright = extract_copyright(orig_code) || "";
        if (copyright.length) copyright += "\n\n";

        // compress javascript
        var ast = jsp.parse(orig_code); // parse code and get the initial AST
        ast = pro.ast_mangle(ast); // get a new AST with mangled names
        ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
        final_code = copyright + pro.split_lines(pro.gen_code(ast), 32 * 1024); // compressed code here
      } else if (/\.css$/.test(name)) {
        // compress css
        final_code = uglifycss.processString(orig_code);
      } else {
        return cb("can't determine content type: " + name);
      }
      cb(null, final_code);
    } catch(e) {
      cb("error compressing: " + e.toString() + "\n");
    }
  }

  compress();
}

process.on('message', function(m) {
  compressResource(m.name, m.content, function(err, content) {
    if (err) process.send({ error: err });
    else process.send({ content: content });
  });
});
