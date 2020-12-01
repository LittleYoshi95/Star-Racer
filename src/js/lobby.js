$(() => {
	var selectElem, imgElem;
	selectElem = document.getElementById("lvlSelect");
	imgElem = document.getElementById("lvlImg");
	document.getElementById("soloBtn").onclick = () => {
		console.log("game started!");
		var param = imgElem.src.split("/");
		location.href = `game-screen.html${"?" + param[param.length - 1]}`;
	};
	document.getElementById("multiBtn").onclick = () => {
		console.log("game started!");
		var param = imgElem.src.split("/");
		location.href = `game-screen.html${"?" + param[param.length - 1]}`;
	};

	selectElem.addEventListener("change", (event) => {
		if (event.target.value == "Milk") {
			imgElem.src = "/assets/milkyWay.jpg";
		} else if (event.target.value == "Sun") {
			imgElem.src = "/assets/bigSunset.jpg";
		} else if (event.target.value == "City") {
			imgElem.src = "/assets/cityNight.jpg";
		}
	});
});
