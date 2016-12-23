var http = require('http');
var url = require('url');

var server = new http.Server(function(req, res)
{
	var urlParsed = url.parse(req.url, true);

	// console.log(req.method, req.url);
	console.log(urlParsed.query);
	console.log(req.headers);

	if(/\/echo\/?$/i.test(urlParsed.pathname) && urlParsed.query.message)
	{
		res.setHeader('Cache-control', 'no-cache');
		res.setHeader('X-Test', 'This test');
		res.end(urlParsed.query.message);
	}
	else
	{
		res.statusCode = 404;
		res.end("Page not found");
	}
});

server.listen(1337, '127.0.0.1');