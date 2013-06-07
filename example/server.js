var minify = require('..'),
   express = require('express');

var app = express();

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(minify({
  assets: {
    "/css.css": [
      "/css/a.css",
      "/css/b.css"
    ],
    "/main.js": [
      "/js/script1.js",
      "/js/script2.js",
      "/js/script3.js"
    ],
    "/i/myimg.png": "/i/myimg.png"
  },
  root: "static"
}));

app.get('/', function(req, res){
  res.render('hello', {
    who: "world of efficient web serves"
  });
});

app.listen(3000);
