var express = require('express');
var router = express.Router();
var fs = require('fs');

var grabzit = require('grabzit');
var client = new grabzit(process.env.GRABZIT_KEY, process.env.GRABZIT_SECRET);

router.get('/cap/:name/:pt/', function(req, res) {
  var name = req.params.name,
      pt = req.params.pt,
      path = "public/images/"+name+"-"+pt+".png";
  client.set_image_options("http://capturing.herokuapp.com/create/"+encodeURIComponent(name)+"/"+pt+"/", {"format":"png"});
  client.save_to(path);

  var tick = function(){
    if(fs.existsSync(path)){
      res.send(path);
      res.end();
    } else {
      setTimeout(function(){
        tick();
      }, 200);
    }
  };
  tick();

});

router.get('/create/:name/:pt/', function(req, res){
  res.send('<!DOCTYPE html><html><head></head><body><div style="font-size:'+req.params.pt+'pt;">'+req.params.name+'</div></body></html>');
  res.end();
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
