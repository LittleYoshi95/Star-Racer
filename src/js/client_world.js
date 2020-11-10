var container;
var scene;
var camera;
var renderer;
var controls;
var objects = [];
var clock;
var deltaTime;
var keys = {};
var socket;

var player, playerId, moveSpeed, turnSpeed;

var playerData;

var otherPlayers = [],
	otherPlayersId = [];

var acceleration = 0;
var reverseAcceleration = 0;
var steeringAcceleration = 0;

var objetosConColision = [];
var rayCaster;

var isWorldReady = [false];

$(document).ready(function () {
	socket = io();

	socket.on("updatePosition", function (data) {
		updatePlayerPosition(data);
	});
	socket.on("connect", function () {
		loadWorld();
		socket.emit("requestOldPlayers", {});
	});

	socket.on("createPlayer", function (data) {
		createPlayer(data);
	});

	socket.on("addOtherPlayer", function (data) {
		addOtherPlayer(data);
	});

	socket.on("removeOtherPlayer", function (data) {
		removeOtherPlayer(data);
	});
});

var loadWorld = function () {
	setupScene();

	rayCaster = new THREE.Raycaster();

	//var loadFBX = new FBXLoader();

	loadOBJWithMTL("assets/models/", "Pista.obj", "Pista.mtl", (pista) => {
		pista.position.y = -473;
		pista.position.x = 190;
		pista.scale.set(1.2, 1.0, 1.0);

		scene.add(pista);

		objetosConColision.push(pista);

		isWorldReady[0] = true;
	});
	/*
    loadOBJWithMTL("assets/models/", "SciFi_Fighter_AK5.obj", "SciFi_Fighter_AK5.mtl", (object) => {
        nave = object;

        nave.position.z = 0;

        nave.rotation.y = THREE.Math.degToRad(180);

        nave.scale.set(0.01,0.01,0.01);

        scene.add(nave);
        isWorldReady[1] = true;
    });
    */
	render();

	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	function onKeyDown(event) {
		keys[String.fromCharCode(event.keyCode)] = true;
	}
	function onKeyUp(event) {
		keys[String.fromCharCode(event.keyCode)] = false;
	}

	function render() {
		requestAnimationFrame(render);

		if (player) {
			updateCameraPosition();

			checkKeysStates();

			camera.lookAt(player.position);
		}

		renderer.clear();
		renderer.render(scene, camera);
	}

	function setupScene() {
		container = document.getElementById("container");
		var visibleSize = { width: window.innerWidth, height: window.innerHeight };
		clock = new THREE.Clock();
		scene = new THREE.Scene();
		nave = new THREE.Object3D();
		camera = new THREE.PerspectiveCamera(
			75,
			visibleSize.width / visibleSize.height,
			0.1,
			10000
		);
		camera.position.z = 20;
		camera.up = new THREE.Vector3(0, 1, 0);
		//camera.rotation.x = THREE.Math.degToRad(-25);

		renderer = new THREE.WebGLRenderer({ precision: "mediump" });
		renderer.setClearColor(new THREE.Color(0, 0, 0));
		renderer.setPixelRatio(visibleSize.width / visibleSize.height);
		renderer.setSize(visibleSize.width, visibleSize.height);

		var ambientLight = new THREE.AmbientLight(new THREE.Color(1, 1, 1), 1.0);
		scene.add(ambientLight);

		var directionalLight = new THREE.DirectionalLight(
			new THREE.Color(1, 1, 1),
			0.1
		);
		directionalLight.position.set(0, 15, 15);
		scene.add(directionalLight);

		/*var grid = new THREE.GridHelper(50, 10, 0xffffff, 0xffffff);
        grid.position.y = -1;
        scene.add(grid);
        */

		var skyGeo = new THREE.SphereGeometry(5000, 200, 500);
		var loader = new THREE.TextureLoader(),
			texture = loader.load("./assets/milkyWay.jpg");

		var material = new THREE.MeshPhongMaterial({
			map: texture,
		});

		var sky = new THREE.Mesh(skyGeo, material);
		sky.material.side = THREE.BackSide;
		scene.add(sky);

		container.appendChild(renderer.domElement);
		document.body.appendChild(container);
	}
};

function loadOBJWithMTL(path, objFile, mtlFile, onLoadCallback) {
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath(path);
	mtlLoader.load(mtlFile, (materials) => {
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.setPath(path);
		objLoader.load(objFile, (object) => {
			onLoadCallback(object);
		});
	});
}

var createPlayer = function (data) {
	playerData = data;

	loadOBJWithMTL(
		"assets/models/",
		"SciFi_Fighter_AK5.obj",
		"SciFi_Fighter_AK5.mtl",
		(nave) => {
			player = nave;

			player.position.x = data.x;
			player.position.y = data.y;
			player.position.z = data.z;

			player.rotation.y = THREE.Math.degToRad(180);

			player.scale.set(data.sizeX, data.sizeY, data.sizeZ);

			playerId = data.playerId;
			moveSpeed = data.speed;
			turnSpeed = data.turnSpeed;

			updateCameraPosition();

			objects.push(player);
			scene.add(player);

			//Definimos los vectores para detectar la colision
			player.rayos = [
				new THREE.Vector3(1, 0, 0),
				new THREE.Vector3(-1, 0, 0),
				new THREE.Vector3(0, 0, 1),
				new THREE.Vector3(0, 0, -1),
			];

			camera.lookAt(player.position);
		}
	);
};

var updateCameraPosition = function () {
	camera.position.x = player.position.x + 15 * Math.sin(player.rotation.y);
	camera.position.y = player.position.y + 10;
	camera.position.z = player.position.z + 15 * Math.cos(player.rotation.y);
};

var updatePlayerPosition = function (data) {
	var somePlayer = playerForId(data.playerId);

	somePlayer.position.x = data.x;
	somePlayer.position.y = data.y;
	somePlayer.position.z = data.z;

	somePlayer.rotation.x = data.r_x;
	somePlayer.rotation.y = data.r_y;
	somePlayer.rotation.z = data.r_z;
};

var updatePlayerData = function () {
	playerData.x = player.position.x;
	playerData.y = player.position.y;
	playerData.z = player.position.z;

	playerData.r_x = player.rotation.x;
	playerData.r_y = player.rotation.y;
	playerData.r_z = player.rotation.z;
};

var checkKeysStates = function () {
	deltaTime = clock.getDelta();

	var accel = false;

	if (keys["A"]) {
		steeringAcceleration = steeringAcceleration + turnSpeed * deltaTime;
		player.rotation.y += steeringAcceleration * deltaTime;
		updatePlayerData();
		socket.emit("updatePosition", playerData);
	} else if (keys["D"]) {
		steeringAcceleration = steeringAcceleration + turnSpeed * deltaTime;
		player.rotation.y -= steeringAcceleration * deltaTime;
		updatePlayerData();
		socket.emit("updatePosition", playerData);
	}
	if (keys["W"]) {
		accel = true;
		acceleration = acceleration + moveSpeed * deltaTime;
		player.position.x -= acceleration * deltaTime * Math.sin(player.rotation.y);
		player.position.z -= acceleration * deltaTime * Math.cos(player.rotation.y);
		updatePlayerData();
		socket.emit("updatePosition", playerData);
	} else if (keys["S"]) {
		accel = true;
		acceleration -= 100 * deltaTime;
		player.position.x -= acceleration * deltaTime * Math.sin(player.rotation.y);
		player.position.z -= acceleration * deltaTime * Math.cos(player.rotation.y);
		updatePlayerData();
		socket.emit("updatePosition", playerData);
	}

	if (!accel) {
		if (acceleration != 0) {
			player.position.x -=
				acceleration * deltaTime * Math.sin(player.rotation.y);
			player.position.z -=
				acceleration * deltaTime * Math.cos(player.rotation.y);
			acceleration -= 10 * deltaTime;
			steeringAcceleration -= 1 * deltaTime;
			updatePlayerData();
			socket.emit("updatePosition", playerData);
		}
	}

	if (acceleration < 0) {
		acceleration = 0;
	}

	if (reverseAcceleration < 0) {
		reverseAcceleration = 0;
	}

	if (steeringAcceleration < 0) {
		steeringAcceleration = 0;
	}

	if (acceleration >= 300) {
		acceleration = 300;
	}

	if (steeringAcceleration >= 5) {
		steeringAcceleration = 5;
	}

	if (isWorldReady[0]) {
		var colBol = false;

		for (var i = 0; i < player.rayos.length; i++) {
			// var rayo = player.rayos[i];
			rayCaster.set(player.position, player.rayos[i]);
			var colision = rayCaster.intersectObjects(objetosConColision, true);

			if (colision.length > 0 && colision[0].distance < 5) {
				console.log("colsionando");
				player.translateX(moveSpeed * deltaTime * Math.sin(player.rotation.y));
				player.translateZ(moveSpeed * deltaTime * Math.cos(player.rotation.y));
				colBol = true;
			}
		}
	}
};

var addOtherPlayer = function (data) {
	var otherPlayer;
	loadOBJWithMTL(
		"assets/models/",
		"SciFi_Fighter_AK5.obj",
		"SciFi_Fighter_AK5.mtl",
		(nave) => {
			otherPlayer = nave;

			otherPlayer.position.x = data.x;
			otherPlayer.position.y = data.y;
			otherPlayer.position.z = data.z;

			otherPlayer.rotation.y = THREE.Math.degToRad(180);

			otherPlayer.scale.set(data.sizeX, data.sizeY, data.sizeZ);

			playerId = data.playerId;
			moveSpeed = data.speed;
			turnSpeed = data.turnSpeed;

			updateCameraPosition();

			otherPlayersId.push(data.playerId);
			otherPlayers.push(otherPlayer);
			objects.push(otherPlayer);
			scene.add(otherPlayer);
		}
	);
};

var removeOtherPlayer = function (data) {
	scene.remove(playerForId(data.playerId));
};

var playerForId = function (id) {
	var index;
	for (var i = 0; i < otherPlayersId.length; i++) {
		if (otherPlayersId[i] == id) {
			index = i;
			break;
		}
	}
	return otherPlayers[index];
};
