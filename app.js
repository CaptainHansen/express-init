var express = require('express')
  , app = express()
  , fs = require('fs')
  , http = require('http')
  , https = require('https')
  ;

function compileLess (lessDir) {
  var less = require('less');

  switch(lessDir) {
    case "pages":
      var dir = __dirname+"/public/css/pages/";
      break;

    default:
      lessDir = "main";
    case "main":
      var dir = __dirname+"/public/css/";
      break;
  }

  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  var files = fs.readdirSync(__dirname+'/less/'+lessDir+'/');

  var mkRenderCallback = function (fnameBase) {
    return function (er, css) {
      if(er) return console.error(er);
      fs.writeFile(dir+fnameBase+'.css', css, function (e) {
        if(e) return console.error(e);
        console.log("Rendered "+fnameBase+".less");
        //if(app.get('env') === 'development') console.log("LESS Re-compiled successfully");
      });
    }
  }

  var opts = {
    paths: [__dirname+"/less/"]
  }

  for(i in files) {
    var fname = files[i];

    //we don't have to read the layout file!  also, the LESS css mapping in browser dev tools shows layout file name rather than "input: "
    var init = "@import '"+lessDir+"/"+fname+"';";

    if(fname.match(/^\./)) continue;
    var ms = fname.match(/^([^\.]+)/);

    if(app.get('env') === 'development') {
      opts.sourceMap = true;
      opts.sourceMapFilename = dir+ms[1]+".css.map";
    } else {
      opts.compress = true;
    }
    less.render(init, opts, mkRenderCallback(ms[1]));
  }
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
    },
    layoutsDir: __dirname+"/views/layouts/"
  });
  app.engine('.hbs', hbs.engine);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', '.hbs');
}

function setupExpress () {
  var path = require('path')
    , bodyParser = require('body-parser')
    , session = require("express-session")
    , RedisStore = require('connect-redis')(session)
    , compress = require('compression')
//    , logger = require('morgan')
//    , favicon = require('serve-favicon')
    ;

  // uncomment after placing your favicon in /public
  //app.use(favicon(__dirname + '/public/favicon.ico'));

  var redisServer = process.env.REDIS_SERV || "localhost";
  app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    store: new RedisStore({
      host: redisServer,
      port: 6379
    })
  }));
  app.use(compress());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.disable('x-powered-by');
}


/***** my custom stuff *****/
function loadFiles (dir, attachFunc) {
  if(!attachFunc) {
    attachFunc = function (r) { app.use(r); };
  }

  var files = fs.readdirSync(dir);
  for(i in files) {
    //skip all files beginning with a period
    if(files[i].match(/^\./)) continue;
    if(ms = files[i].match(/(.*)\.js$/)) {
      r = require(dir+ms[1]);
      attachFunc(r,ms[1]);
    }
  }
}

compileLess('main');
// compileLess("pages");
setupTemplater();
setupExpress();

// plugins = {};
// loadFiles(__dirname+"/plugins/",function (module, name) {
//   plugins[name] = module;
// });

loadFiles('./middleware/');
loadFiles("./routes/");

// check for less changes and re-compile css (only if we're doing development :-) )
if(app.get('env') === 'development') {
  // watch for less changes 
  fs.watch(__dirname+"/less", function (event, file) {
    console.log(event+" "+file);
    compileLess();
  });
}

// check for less changes and re-compile css (only if we're doing development :-) )
if(app.get('env') === 'development') {
  // watch for less changes 
  fs.watch(__dirname+"/less/includes", function (event, file) {
    compileLess();
    // compileLess('pages');
  });
  fs.watch(__dirname+"/less/main", function (event, file) {
    compileLess();
  });
  // fs.watch(__dirname+"/less/pages", function (event, file) {
  //   compileLess('pages');
  // })
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
    console.error(err.message);
    console.error(err.stack);
    if(req.xhr || req.headers.accept == "application/json") {
      res.set("Content-Type", "text/plain");
      res.send(err.message);
    } else {
      // res.data.layout = "basic";
      res.data.message = err.message;
      res.data.error = err;
      res.render('error', res.data);
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if(req.xhr || req.headers.accept == "application/json") {
    res.set("Content-Type", "text/plain");
    res.send(err.message);
  } else {
    // res.data.layout = "basic";
    res.data.message = err.message;
    res.data.error = false;
    res.render('error', res.data);
  }
});

// launch!
var httpServer = http.createServer(app);
httpServer.listen(process.env.PORT || 3000, function () {
  console.log("HTTP server started");
});

// try {
//   var key = fs.readFileSync(__dirname+"/ssl/server.key");
//   var cert = fs.readFileSync(__dirname+"/ssl/server.cert");
//   var httpsServer = https.createServer({
//     key: key,
//     cert: cert,
//     passphrase: "w5zE8SnNNH9vx6ry2a6TT39F"
//   }, app);
//   httpsServer.listen(3001, function () {
//     console.log("HTTPS server started");
//   })
// } catch (e) {
//   console.log(e);
//   console.log("Required files for SSL not found.");
// }