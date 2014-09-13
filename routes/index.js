var express = require('express')
  , router = module.exports = express.Router()
  ;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});