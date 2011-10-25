

var fs = require("fs");
var exec = require("child_process").exec;

var vnstat_path = '/var/lib/vnstat';

var netdevs_names
function get_netdevs(callback) {
	if (typeof netdevs_names !== "undefined"){
		callback(netdevs_names)
		return 
	}
	var names = {}
	fs.readdir(vnstat_path, function(err1, files){
		if (!err1) {
			n_parse_files = 0;
			n_files = 0;
			files.forEach( function printLi(n, index, array){
				if (n[0] == ".") return
				n_files ++ ;
				console.log("Found dev: "+n)
				child = exec('vnstat -i '+n+' --oneline')
				child.stdout.on("data", function(name) {
					name = name.split(";")[1]
					if (!name) name = n
					names[n] = name
					console.log("Parsed dev: "+n)
					n_parse_files ++;

					// last
					if (n_files == n_parse_files) {
						netdevs_names = names
						callback(netdevs_names)
					}
				});
			});

		}
	});
}
function get_and_validate_netdev(netdev, callback){
	get_netdevs(function(netdevs){
		if (netdevs.hasOwnProperty(netdev))
			callback(netdevs, true);
		else
			callback(netdevs, false);
	});
}

exports.get_netdevs = get_netdevs
exports.get_and_validate_netdev = get_and_validate_netdev
