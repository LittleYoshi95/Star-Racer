var gulp = require("gulp");
var browserSync = require("browser-sync").create();
var sass = require("gulp-sass");
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var world = require("./src/js/server_world.js");
var fs = require("fs");

app.use(express.static("src"));

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/src/index.html");
});

app.get("/js/client_world.js", function (req, res) {
	res.sendFile(__dirname + "/js/client_world.js");
});

app.get("/css/bootstrap.css", function (req, res) {
	res.sendFile(__dirname + "/css/bootstrap.css");
});

app.get("/css/styles.css", function (req, res) {
	res.sendFile(__dirname + "/css/styles.css");
});

app.get("/controls.html", function (req, res) {
	res.sendFile(__dirname + "/controls.html");
});

app.get("/options.html", function (req, res) {
	res.sendFile(__dirname + "/options.html");
});

app.get("/leaderboard.html", function (req, res) {
	res.sendFile(__dirname + "/leaderboard.html");
});

app.get("/game-screen.html", function (req, res) {
	res.sendFile(__dirname + "/game-screen.html");
});

app.get("/js/bootstrap.min.js", function (req, res) {
	res.sendFile(__dirname + "/js/bootstrap.min.js");
});

app.get("/js/popper.min.js", function (req, res) {
	res.sendFile(__dirname + "/js/popper.min.js");
});

app.get("/js/jquery.min.js", function (req, res) {
	res.sendFile(__dirname + "/js/jquery.min.js");
});

app.get("/js/three.min.js", function (req, res) {
	res.sendFile(__dirname + "/js/three.min.js");
});

app.get("/js/three-obj-mtl-loader.js", function (req, res) {
	res.sendFile(__dirname + "/js/three-obj-mtl-loader.js");
});

app.get("/js/three-fbx-loader.js", function (req, res) {
	res.sendFile(__dirname + "/js/three-fbx-loader.js");
});

io.on("connection", function (socket) {
	console.log("a user connected " + socket.id);

	var id = socket.id;
	world.addPlayer(id);

	var player = world.playerForId(id);
	socket.emit("createPlayer", player);

	socket.broadcast.emit("addOtherPlayer", player);

	socket.on("requestOldPlayers", function () {
		for (var i = 0; i < world.players.length; i++) {
			if (world.players[i].playerId != id)
				socket.emit("addOtherPlayer", world.players[i]);
		}
	});

	socket.on("updatePosition", function (data) {
		var newData = world.updatePlayerData(data);
		socket.broadcast.emit("updatePosition", newData);
	});

	socket.on("disconnect", function () {
		console.log("user disconnected");
		io.emit("removeOtherPlayer", player);
		world.removePlayer(player);
	});
	socket.on("storeTimes", function (data) {
		console.log("updating times leaderboard json file...");
		var newJSON = JSON.stringify(data, null, 2);
		fs.writeFileSync("./src/bestTimes.json", newJSON);
		console.log("done, file updated with new info");
	});
});

var port = process.env.PORT || 8080;
var ip_address = process.env.IP || "127.0.0.1";

//Compile SASS into CSS & auto-inject into browsers
gulp.task("sass", function () {
	return gulp
		.src(["node_modules/bootstrap/scss/bootstrap.scss", "src/scss/*.scss"])
		.pipe(sass())
		.pipe(gulp.dest("src/css"))
		.pipe(browserSync.stream());
});

//Move the javascript files into our /src/js folder
gulp.task("js", function () {
	return gulp
		.src([
			"node_modules/bootstrap/dist/js/bootstrap.min.js",
			"node_modules/jquery/dist/jquery.min.js",
			"node_modules/popper.js/dist/umd/popper.min.js",
			"node_modules/socket.io-client/dist/socket.io.js"
		])
		.pipe(gulp.dest("src/js"))
		.pipe(browserSync.stream());
});

//Static server + watching scss/html files
gulp.task("serve", ["sass"], function () {
	http.listen(port, ip_address, function () {
		console.log("Listening on " + ip_address + ", server_port " + port);
	});

	gulp.watch(
		["node_modules/bootstrap/scss/bootstrap.scss", "src/scss/*.scss"],
		["sass"]
	);
	gulp.watch("src/*.html").on("change", browserSync.reload);
});

gulp.task("default", ["js", "serve"]);
