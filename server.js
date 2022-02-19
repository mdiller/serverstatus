var express = require("express");
var gamedig = require("gamedig");
var favicon = require("serve-favicon");
var fs = require("fs");
var https = require("https");
var path = require("path");

var app = express();

var config = JSON.parse(fs.readFileSync("./config.json"));

app.use("/images", express.static("images"));
app.use(favicon("./favicon.ico"));


app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname + "/index.html"));
});

// Gets a list of servers
app.get("/servers", function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(config.servers));
});

// Gets info for one server
app.get("/server/:servername", function (req, res) {
	var name = req.params.servername
	if (!config.servers.some(server => server.name == name)) {
		res.statusCode = 404;
		res.send("server by that name not found!")
		return;
	}
	var server = config.servers.find(s => s.name == name);
	gamedig.query(server).then(data => {
		server["status"] = data;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(server));
	}).catch(e => {
		server["status"] = null;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(server));
	});
});


app.listen(config.port);

if (config.ssl) {
	https.createServer({
		key: fs.readFileSync(config.ssl.key, "utf8"),
		cert: fs.readFileSync(config.ssl.certificate, "utf8")
	}, app).listen(config.ssl.port);
}
