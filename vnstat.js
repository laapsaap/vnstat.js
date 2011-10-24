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

function map_url(netdev, index, array){
	if (netdev[0] == ".") return

	console.log("map /"+netdev);
	urllist["/"+netdev+"/"] = request.home;
	urllist["/"+netdev+"/hour"] = request.hour;
	urllist["/"+netdev+"/graph-h"] = request.hourgraph;
	urllist["/"+netdev+"/day"] = request.day;
	urllist["/"+netdev+"/graph-d"] = request.daygraph;
	urllist["/"+netdev+"/week"] = request.week;
	urllist["/"+netdev+"/graph-w"] = request.weekgraph;
	urllist["/"+netdev+"/month"] = request.month;
	urllist["/"+netdev+"/graph-m"] = request.monthgraph;
	urllist["/"+netdev+"/graph-s"] = request.sumgraph;
	urllist["/"+netdev+"/graph-t"] = request.topgraph;
}

vnstat_path = '/var/lib/vnstat'
fs.readdir(vnstat_path, function(err1, files){

	function redirect(response){
		response.writeHead(302, {
		'Location': '/'+files[0]+'/'
		});
		response.end();
	}
	urllist["/"] = redirect;

	if (err1) {
	} else {
		files.forEach(map_url);
	}
})

//**********
// Main
//**********

server.start(router.route, urllist);
