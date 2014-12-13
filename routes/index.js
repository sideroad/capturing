var express = require('express');
var router = express.Router();
var fs = require('fs');
var phantom = require('phantom');


router.get('/cap/:name/:pt/', function(req, res) {
  var name = req.params.name,
      pt = req.params.pt,
      path = "public/images/"+name+"-"+pt+".png";


  phantom.create(function (ph) {
    ph.createPage(function (page) {
      page.open("http://capturing.herokuapp.com/create/"+encodeURIComponent(name)+"/"+pt+"/", function (status) {
        page.evaluate(function () { return document.title; }, function (result) {
          console.log('Page title is ' + result);
          ph.exit();
        });
      });
    });
  });

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
  res.send('<!DOCTYPE html><html><head><title>abc</title></head><body><div style="font-size:'+req.params.pt+'pt;">'+req.params.name+'</div></body></html>');
  res.end();
});

module.exports = router;
