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

var cmd_vnstat = '/usr/bin/vnstat';
var cmd_vnstati = '/usr/bin/vnstati -c 5';

var vnstat_path = '/var/lib/vnstat'
var netdevlist ;
fs.readdir(vnstat_path, function(err1, files){
	netdevlist = files;
})

function htmlheader(netdev){ 
	var netdevlist_html = '';
	
	function printLi(n, index, array){
		if (n[0] == ".") return
		netdevlist_html += '<li><a class="button gray" href="/'+n+'/">'+n+'</li>'
	}
	netdevlist.forEach(printLi)

	return '<html>'+
		 '<head>'+
		 '<meta http-equiv="Content-Type" content="text/html; '+
		 'charset=UTF-8" />'+
		 '<link rel="stylesheet" href=\"/css/style.css\">'+
		 '</head>'+
		 '<body>'+
		 '<sidebar>'+ 
		 '<ul>'+netdevlist_html+'</ul>'+
		 '</sidebar>'+ 
		 '<header>'+ 
		 '<ul><li><a class="button orange" href=\"/'+netdev+'/\">Home</a></li><li><a class="button gray" href=\"/'+netdev+'/hour\">Hour</a></li><li><a class="button gray" href=\"/'+netdev+'/day\">Day</a></li><li><a class="button gray" href=\"/'+netdev+'/week\">Week</a></li><li><a class="button gray" href=\"/'+netdev+'/month\">Month</a></li></ul>'+
		 '</header>'+
		 '<div id=\"container\">';
}
var htmlfooter = '</div> <!-- #container -->'+
		 '</body>'+
		 '<footer><a href="https://github.com/nicolargo/vnstat.js">'+prg_name+'</a> version '+prg_version+' is powered by <a href="http://nodejs.org/">Node.js</a></footer>'+
		 '</html>';
// Privates functions

function statichtml(urlpath, res, uri) {
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

function vnstat(urlpath, res, opt) {
    var netdev = urlpath.split("/")[1]
	console.log("Request: "+opt);
	var command = cmd_vnstat+' -i '+netdev+" "+opt;
	exec(command, function (error, stdout, stderr) {
		var body = stdout;
		var netdev = urlpath.split("/")[1]

		body = 	"<div id=\"graph\"><img class=\"shadow\" src=\"/"+netdev+"/graph"+opt+"\" /></div>"+
			"<div id=\"text\"><pre>"+body+"</pre></div>";

		var html = htmlheader(netdev)+body+htmlfooter;

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(html);
		res.end();
	});
}

function vnstati(urlpath, res, opt) {
    var netdev = urlpath.split("/")[1]
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

function css(urlpath, res) {
	statichtml(urlpath, res, 'css/style.css');
}

function home(urlpath, res) {
    var netdev = urlpath.split("/")[1]
	console.log("Request home page: "+netdev);

  // var vnstatrt = spawn("/usr/bin/vnstat", ["-tr"]);

  // vnstatrt.stdout.on('data', function (data) {
  //  console.log("RT: "+data);
  //  document.getElementById("text").innerHTML = data;
  // });

  var body = "<div id=\"graph\"><img class=\"shadow\" src=\"/"+netdev+"/graph-s\" /></div>"+
       "<div id=\"graph\"><img class=\"shadow\" src=\"/"+netdev+"/graph-t\" /></div>"+
       "<div id=\"text\"></div>";

  var html = htmlheader(netdev)+body+htmlfooter;

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(html);
  res.end();
}

function hour(urlpath, res) {
	vnstat(urlpath, res, '-h');
}

function hourgraph(urlpath, res) {
	vnstati(urlpath, res, '-h');
}

function day(urlpath, res) {
	vnstat(urlpath, res, '-d');
}

function daygraph(urlpath, res) {
	vnstati(urlpath, res, '-d');
}

function week(urlpath, res) {
	vnstat(urlpath, res, '-w');
}

function weekgraph(urlpath, res) {
	// The Weekly graph did not exist, display the last days one...
	vnstati(urlpath, res, '-d');
}

function month(urlpath, res) {
	vnstat(urlpath, res, '-m');
}

function monthgraph(urlpath, res) {
	vnstati(urlpath, res, '-m');
}

function sumgraph(urlpath, res) {
	vnstati(urlpath, res, '-s');
}

function topgraph(urlpath, res) {
	vnstati(urlpath, res, '-t');
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

