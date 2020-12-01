window.fbAsyncInit = function () {
	FB.init({
		appId: "394150178367487",
		xfbml: true,
		version: "v2.9"
	});
	FB.AppEvents.logPageView();
};

(function (d, s, id) {
	var js,
		fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {
		return;
	}
	js = d.createElement(s);
	js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

var shareTime = function () {
	FB.ui(
		{
			method: "share",
			href: "https://star-racer.herokuapp.com/",
			hashtag: "#zooooom",
			quote: "Ven y vence mi tiempo! >:^)"
		},
		function (response) {}
	);
};
