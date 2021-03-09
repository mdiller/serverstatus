var express = require("express");
var gamedig = require("gamedig");
var favicon = require("serve-favicon");
var fs = require("fs");

var app = express();

var config = JSON.parse(fs.readFileSync("./config.json"));

app.use("/images", express.static("images"));
app.use(favicon("./favicon.ico"));

function StatusToHtml(statuses) {
	var html = "<table>";
	statuses.forEach(server => {
		html += "<tr>";
		html += `<td><img src="${server.icon}" width="24" height="24"></td>`;
		html += `<td>${server.name}</td>`;
		if (server.status) {
			var maxplayers = server.maxplayers ? server.maxplayers : server.status.maxplayers;
			html += `<td style="color: green">${server.status.players.length} / ${maxplayers}</td>`;
		}
		else {
			html += `<td style="color: red">Offline</td>`;
		}
		html += "</tr>";
	})

	html += "</table>";
	return html;
}

app.get("/", function(req, res) {
	var html = fs.readFileSync("./index.html", { encoding: "utf8", flag: "r" });

	var promises = config.servers.map(server => gamedig.query(server).then(data => {
		server["status"] = data;
		return server;
	}).catch(e => {
		server["status"] = null;
		return server;
	}));

	Promise.all(promises).then(function (data) {
		html = html.replace("DATAGOESHERE", StatusToHtml(data))
		html = html.replaceAll("TITLEGOESHERE", config.title)
		res.send(html);
	});
	// res.sendFile(path.join(__dirname + "/index.html"));
});


app.listen(config.port);