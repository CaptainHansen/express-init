function getJS (js) {
  var ret = "";
  for(i in js) {
    ret += '<script type="text/javascript" src="'+js[i]+'"></script>';
  }
  return ret;
}

function getCSS (css) {
  var ret = "";
  for(i in css) {
    ret += '<link rel="stylesheet" href="'+css[i]+'"></script>';
  }
  return ret;
}

module.exports = function (req, res, next) {
  res.data = { js: [], css: [], helpers: [] };
  res.data.helpers.getJS = getJS;
  res.data.helpers.getCSS = getCSS;
  res.data.js.push("/js/test.js");
  res.data.css.push("/css/style.css");
  next();
}