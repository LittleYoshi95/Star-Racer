$(() => {
	var timeData;
	var top10;
	var leaderboardElem = document.getElementById("leaderboardList");

	$.getJSON("bestTimes.json", function (data, status) {
		timeData = data;
		top10 = timeData.bestTimes.sort((a, b) => {
			return a.time.localeCompare(b.time);
		});
		for (var i = 0; i < top10.length; i++) {
			var entry = document.createElement("li");
			entry.classList.add("list-group-item");
			entry.classList.add("text-center");
			var dataText = `${top10[i].tag} --- ${top10[i].time}`;
			var newText = document.createTextNode(dataText);
			entry.appendChild(newText);
			leaderboardElem.insertBefore(entry, null);
		}
	});
});
