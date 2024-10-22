var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require('lodash');
var querystring = require('querystring');
var path = require('path');
var crypto = require('crypto');
var files = require("glob").sync('/app/public/images/*');
var optimage = require('optimage');

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
      filename,
      filepath,
      minpath;

  md5.update(basename+'-'+width+'-'+height+'-'+querystring.stringify(req.query));
  filename = md5.digest('hex');
  filepath = "public/images/"+filename+extname;
  minpath = "public/images/"+filename+'.min'+extname;

  console.log(filepath);
  if(fs.existsSync('/app/'+minpath)){
    res.sendFile(minpath, {
      root: '/app/'
    });
  } else {
    phantom.create(function (ph) {
      ph.createPage(function (page) {
        page.set('viewportSize', {
          width: width,
          height: height
        });
        page.open("http://capturing.herokuapp.com/create/"+width+"/"+height+"/"+encodeURIComponent(basename)+"/?"+querystring.stringify(req.query), function (status) {
          page.render('/app/'+filepath, {format: extname.substr(1)}, function(){
            optimage({
                inputFile: '/app/'+filepath,
                outputFile: '/app/'+minpath
            }, function(err){
              res.sendFile(minpath, {
                root: '/app/'
              });
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
                width: '100%',
                height: req.params.height+'px'
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
