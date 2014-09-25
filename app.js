var express = require('express')
  , exphbs = require('express-handlebars')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , app = express()
  ;

// views engine setup
var hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    getJS: function () { return "No."; },
    getCSS: function () { return "no css..."; }
  }
});
app.engine('.hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/***** my custom stuff *****/
function loadFiles (dir) {
  var files = require('fs').readdirSync(dir);
  for(i in files) {
    if(ms = files[i].match(/(.*)\.js$/)) {
      r = require(dir+ms[1]);
      app.use(r);
    }
  }
}

loadFiles('./middleware/');
loadFiles("./routes/");
/****** end of that... *****/


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// launch!
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {});