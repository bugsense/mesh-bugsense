var getNotice = require('./getNotice');

module.exports = function(error, apiKey) {
	var notice = getNotice(error);

	var url = "http://bugsense.appspot.com/api/errors?api_key=" + apiKey + "&data=" + escape(JSON.stringify(notice));

	console.log(url);

	var script = document.createElement('iframe');
	script.id="bugsense-iframe";
	script.src= url;
	script.width=1;
	script.height=1;

	function sendNow() {
		document.body.appendChild(script);
	}


	if(!document.body) {
		setTimeout(sendNow, 500);
	} else {
		sendNow();
	}
}