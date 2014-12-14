var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require('lodash');
var querystring = require('querystring');
var path = require('path');
var crypto = require('crypto');
var files = require("glob").sync('/app/public/images/*');

files.forEach(function(file){
  console.log(file);
  fs.unlink(file);
});

router.get('/cap/:width/:height/:name', function(req, res) {
  var name = req.params.name,
      width = req.params.width,
      height = req.params.height,
      phantom = require('phantom'),
      extname = path.extname(name),
      basename = path.basename(name, extname),
      md5 = crypto.createHash('md5'),
      filepath;

  md5.update(basename+'-'+width+'-'+height);
  filepath = "public/images/"+md5.digest('hex')+extname;

  console.log(filepath);
  if(fs.existsSync('/app/'+filepath)){
    res.sendFile(filepath, {
      root: '/app/'
    });
  } else {
    phantom.create(function (ph) {
      ph.createPage(function (page) {
        page.open("http://capturing.herokuapp.com/create/"+width+"/"+height+"/"+encodeURIComponent(basename)+"/?"+querystring.stringify(req.query), function (status) {
          page.set('viewportSize', {
            width: width,
            height: height
          });
          page.render('/app/'+filepath, {format: extname.substr(1)}, function(){
            res.sendFile(filepath, {
              root: '/app/'
            });
          });
        });
      });
    });

  }
});

router.get('/create/:width/:height/:name/', function(req, res){
  var style = _.chain({
                'text-overflow': 'ellipsis',
                'white-space': 'nowrap',
                'overflow': 'hidden',
                'font-family': 'Hiragino Kaku Gothic Pro'
               })
               .extend(req.params, req.query, {
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
