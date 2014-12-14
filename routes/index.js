var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require('lodash');
var querystring = require('querystring');
var path = require('path');

router.get('/cap/:name/:width/:height/', function(req, res) {
  var name = req.params.name,
      width = req.params.width,
      height = req.params.height,
      phantom = require('phantom'),
      filepath = "images/"+name+"-"+width+"-"+height+".png";


  phantom.create(function (ph) {
    ph.createPage(function (page) {
      page.open("http://capturing.herokuapp.com/create/"+encodeURIComponent(name)+"/"+width+"/"+height+"?"+querystring.stringify(req.query), function (status) {
        page.set('viewportSize', {
          width: width,
          height: height
        });
        console.log(path.join(__dirname, '../public', filepath));
        page.render(path.join(__dirname, '../public', filepath), function(){
          res.sendFile(path, {
            root: path.join(__dirname, '../public', filepath),
          });
        });
      });
    });
  });

});

router.get('/create/:name/:width/:height/', function(req, res){
  var style = _.chain({
                'text-overflow': 'ellipsis',
                'white-space': 'nowrap',
                'overflow': 'hidden',
                'font-family': 'Hiragino Kaku Gothic Pro'
               })
               .extend(req.params, {
                name: '',
                width: '100%'
               })
               .map(function(val, key){
                return val ? key+': '+val : '';
               })
               .compact()
               .value()
               .join('; ')+';';

  console.log(style);
  res.send('<!DOCTYPE html><html><head><title>abc</title><link rel="stylesheet" type="text/css" href="/stylesheets/style.css"></head><body><div style="'+style+'">'+req.params.name+'</div></body></html>');
  res.end();
});

module.exports = router;
