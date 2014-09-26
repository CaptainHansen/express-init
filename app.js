var express = require('express')
  , app = express()
  ;

function compileLess () {
  var fs = require('fs');
  var less = require('less');

  fs.readFile(__dirname+'/less/style.less', function(err,styles) {
      if(err) return console.error('Could not open file: %s',err);
      less.render(styles.toString(), {compress: true, paths: [__dirname+'/less/']}, function(er,css) {
          if(er) return console.error(er);
          fs.writeFile(__dirname+'/public/stylesheets/style.css', css, function(e) {
            if(e) return console.error(e);
          });
      });
  });
}


function setupTemplater () {
  var exphbs = require('express-handlebars');
  var path = require('path');

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
}

function setupExpress () {
  var path = require('path')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
//    , logger = require('morgan')
//    , favicon = require('serve-favicon')
    ;

  // uncomment after placing your favicon in /public
  //app.use(favicon(__dirname + '/public/favicon.ico'));
  //app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
}


/***** my custom stuff *****/
function loadFiles (dir) {
  var fs = require('fs');

  var files = fs.readdirSync(dir);
  for(i in files) {
    if(ms = files[i].match(/(.*)\.js$/)) {
      r = require(dir+ms[1]);
      app.use(r);
    }
  }
}

compileLess();
setupTemplater();
setupExpress();
loadFiles('./middleware/');
loadFiles("./routes/");

// check for less changes and re-compile css (only if we're doing development :-) )
if(app.get('env') === 'development') {
  // watch for less changes 
  var fs = require('fs');
  fs.watch(__dirname+"/less", function (event, file) {
    console.log(event+" "+file);
    compileLess();
  });
}

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