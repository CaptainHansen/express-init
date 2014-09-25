var express = require('express')
  , router = module.exports = express.Router()
  ;

/* GET home page. */
router.get('/', function(req, res) {
  res.data.title = "Express TEST";
  res.render('index', res.data);
});