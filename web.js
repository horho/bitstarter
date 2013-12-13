var http = require('http');
var fs = require('fs');
var util = require('util');

var server = http.createServer();
server.on('request', function(req, res) {
	var file = "."+req.url;
	if(file == "./") {
		file = "./index.html";
	}
	var content = '';
	var msg = 200;
	fs.stat(file, function(err, stats) {
		if(err) {
			content = 'Error 404 '+err.message; 
			msg = 404;
			console.log('Error 404 '+err.message); 
			return;
		}
		var readBuffer = new Buffer(stats.size);

		fs.open(file, 'r', function(err, fd) {
			if(err) {
				content = 'Error 404: '+err.message;
				msg = 404;
				console.log('Error 404 '+err.message); 
				return;
			}
			var bufferOffset = 0,
					bufferLength = readBuffer.length,
					filePosition = 0;
			fs.read(fd, readBuffer, bufferOffset, bufferLength, filePosition, function(err, readBytes) {
				if(err) {
					content = 'Error 404: '+err.message;
					msg = 404;
					console.log('Error 404 '+err.message); 
					return;
				}
				if(readBytes > 0) {
					content = readBuffer.slice(0, readBytes).toString();
				}
			});
		console.log(JSON.stringify(req.headers));
		res.writeHead(200, {'Content-Type' : 'text/plain'});
		res.write(content);
		res.end();
		});
	});
});
server.listen(8080);

/*
var util = require('util');
require('http').createServer(function(req, res) {
	res.writeHead(200, {'Content-Type' : 'text/plain'});
	res.end(util.inspect(req.headers));
}).listen(8080);
*/
