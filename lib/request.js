//
// VnStat in a Node.js
//
// Nicolas Hennion (aka) Nicolargo
//
// GPL v3.0
//

var prg_name = 'VnStat.js'
var prg_version = '0.1';

var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;
var spawn = require('child_process').spawn;
var netdevs = require('./netdevs');

var cmd_vnstat = '/usr/bin/vnstat';
var cmd_vnstati = '/usr/bin/vnstati -c 5';

function render(netdev, netdevs, res, body){ 
	
	var html = '<html>'+
		 '<head>'+
		 '<meta http-equiv="Content-Type" content="text/html; '+
		 'charset=UTF-8" />'+
		 '<link rel="stylesheet" href=\"/css/style.css\">'+
		 '</head>'+
		 '<body>'+
		 '<sidebar>'+ 
		 '<ul>'
		
	for (key in netdevs){
		if (key == netdev)
			color = "orange"
		else
			color = "gray"
		html += '<li><a class="button '+color+'" href="/'+key+'/">'+netdevs[key]+'</a></li>'
	}

	html +='</ul>'+
		 '</sidebar>'+ 
		 '<header>'+ 
		 '<ul><li>'+
		 '<a class="button orange" href=\"/'+netdev+'/\">Home</a></li><li><a class="button gray" href=\"/'+netdev+'/hour\">Hour</a></li><li><a class="button gray" href=\"/'+netdev+'/day\">Day</a></li><li><a class="button gray" href=\"/'+netdev+'/week\">Week</a></li><li><a class="button gray" href=\"/'+netdev+'/month\">Month</a></li></ul>'+
		 '</header>'+
		 '<div id=\"container\">';

	html += body ;

	html += '</div> <!-- #container -->'+
		 '</body>'+
		 '<footer><a href="https://github.com/nicolargo/vnstat.js">'+prg_name+'</a> version '+prg_version+' is powered by <a href="http://nodejs.org/">Node.js</a></footer>'+
		 '</html>';

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write(html);
	res.end();

}
// Privates functions

function statichtml(netdev, netdevs, res, uri) {
	console.log("Request static file: "+uri);
	var filename = path.join(process.cwd(), uri);
	console.log("File path: "+filename);
	path.exists(filename, function(exists) {
		if (!exists) {
			console.log("Can not read the file " + filepath)
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.write("404 Not found");
			res.end();
			return;
		}

		res.writeHead(200, {'Content-Type': 'text/html'});
		fs.createReadStream(filename, {
			'flags': 'r',
			'encoding': 'binary',
			'mode': 0666,
			'bufferSize': 4 * 1024
		}).addListener("data", function(chunk) {
			res.write(chunk, 'binary');
		}).addListener("close",function() {
			res.end();
		});
	});
}

function vnstat(netdev, netdevs, res, opt) {
	console.log("Request: "+opt);
	var command = cmd_vnstat+' -i '+netdev+" "+opt;
	exec(command, function (error, stdout, stderr) {
		var body = stdout;

		body = 	"<div id=\"graph\"><img class=\"shadow\" src=\"/"+netdev+"/graph"+opt+"\" /></div>"+
			"<div id=\"text\"><pre>"+body+"</pre></div>";

		render(netdev, netdevs, res, body)
	});
}

function vnstati(netdev, netdevs, res, opt) {
	console.log("Request graph: "+netdev+" - "+opt);
	var filename = "./vnstat-"+netdev+opt+'.png';
	var command = cmd_vnstati+' -i '+netdev+' '+opt+' -o '+filename;
	exec(command, function (error, stdout, stderr) {
		res.writeHead(200, {'Content-Type': 'image/png'});
		fs.createReadStream(filename, {
			'flags': 'r',
			'encoding': 'binary',
			'mode': 0666,
			'bufferSize': 4 * 1024
		}).addListener("data", function(chunk) {
			res.write(chunk, 'binary');
		}).addListener("close", function() {
			res.end();
		});
  });
}

// Publics functions

function css(netdev, netdevs, res) {
	statichtml(netdev, netdevs, res, 'css/style.css');
}

function home(netdev, netdevs, res) {
	console.log("Request home page for "+netdev);

/*
   var vnstatrt = spawn("/usr/bin/vnstat", ["-tr"]);

   vnstatrt.stdout.on('data', function (data) {
	   console.log("RT: "+data);

   });
*/

	var body = "<div id=\"graph\"><img class=\"shadow\" src=\"/"+netdev+"/graph-s\" /></div>"+
	"<div id=\"graph\"><img class=\"shadow\" src=\"/"+netdev+"/graph-t\" /></div>"+
	"<div id=\"text\"><pre></pre></div>";

	render(netdev, netdevs, res, body)

}

function hour(netdev, netdevs, res) {
	vnstat(netdev, netdevs, res, '-h');
}

function hourgraph(netdev, netdevs, res) {
	vnstati(netdev, netdevs, res, '-h');
}

function day(netdev, netdevs, res) {
	vnstat(netdev, netdevs, res, '-d');
}

function daygraph(netdev, netdevs, res) {
	vnstati(netdev, netdevs, res, '-d');
}

function week(netdev, netdevs, res) {
	vnstat(netdev, netdevs, res, '-w');
}

function weekgraph(netdev, netdevs, res) {
	// The Weekly graph did not exist, display the last days one...
	vnstati(netdev, netdevs, res, '-d');
}

function month(netdev, netdevs, res) {
	vnstat(netdev, netdevs, res, '-m');
}

function monthgraph(netdev, netdevs, res) {
	vnstati(netdev, netdevs, res, '-m');
}

function sumgraph(netdev, netdevs, res) {
	vnstati(netdev, netdevs, res, '-s');
}

function topgraph(netdev, netdevs, res) {
	vnstati(netdev, netdevs, res, '-t');
}

exports.home = home;
exports.css = css;
exports.hour = hour;
exports.hourgraph = hourgraph;
exports.day = day;
exports.daygraph = daygraph;
exports.week = week;
exports.weekgraph = weekgraph;
exports.month = month;
exports.monthgraph = monthgraph;
exports.sumgraph = sumgraph;
exports.topgraph = topgraph;

