## Usage

    var minify = require('connect-minify');

    app.use(minify({
      // assets map - maps served file identifier to a list of resources
      assets: {
        "/js/main.min.js": [
          '/js/lib/jquery.js',
          '/js/magick.js',
          '/js/laughter.js'
        ],
        "/css/home.min.css": [
          '/css/reset.css',
          '/css/home.css'
        ],
        "/css/dashboard.min.css": [
          '/css/reset.css',
          '/css/common.css'
          '/css/dashboard.css'
        ] },
      // root - where resources can be found
      root: path.join(__dirname, '..', 'static),
      // default is to minify files
      disable_minification: false
    });

Then later to generate a URL:

    app.use(function(req, res, next) {
      req.minifiedURL('/css/home.min.css');
    });

Or to do the same in a template:

    <head>
      <script src="<%- minifiedURL('/js/main.min.js') %>"></script>
    </head>

