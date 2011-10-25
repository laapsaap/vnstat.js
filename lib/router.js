//
// VnStat in a Node.js
//
// Nicolas Hennion (aka) Nicolargo
//
// GPL v3.0
//

var get_and_validate_netdev = require('./netdevs').get_and_validate_netdev;

function route(handle, path, res) {
	console.log ("Route to "+path);
	var netdev = path.split("/")[1];

	get_and_validate_netdev(netdev, function(netdevs, is_valid){
		if (is_valid) {
			path = path.replace(netdev, "%s");
		}

		if (typeof handle[path] != 'function' && !netdev) {
			for (netdev in netdevs){
				break
			}
			res.writeHead(302, { 'Location': '/'+netdev+'/'});
			res.end();
		} else if (typeof handle[path] === 'function') {
			// Execute the function related to the path
			return handle[path](netdev, netdevs, res);
		} else {
			console.log("No function defined for the URL:" + path)	
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.write("404 Not found");
			res.end();
		}
	});
}

exports.route = route;
