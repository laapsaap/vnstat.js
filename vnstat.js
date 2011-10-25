#!/usr/bin/node
//
// VnStat in a Node.js
//
// Nicolas Hennion (aka) Nicolargo
//
// GPL v3.0
//

var fs = require("fs");

var server = require('./lib/server');
var router = require('./lib/router');
var request = require('./lib/request');

var urllist = {}
urllist["/css/style.css"] = request.css;
urllist["/%s/"] = request.home;
urllist["/%s/hour"] = request.hour;
urllist["/%s/graph-h"] = request.hourgraph;
urllist["/%s/day"] = request.day;
urllist["/%s/graph-d"] = request.daygraph;
urllist["/%s/week"] = request.week;
urllist["/%s/graph-w"] = request.weekgraph;
urllist["/%s/month"] = request.month;
urllist["/%s/graph-m"] = request.monthgraph;
urllist["/%s/graph-s"] = request.sumgraph;
urllist["/%s/graph-t"] = request.topgraph;

//**********
// Main
//**********

server.start(router.route, urllist);
