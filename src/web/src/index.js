var getScript = require('./getScript'),
sendBug       = require('./sendBug');


//first find the script
var thisScriptSrc = getScript({
	test: function(src) {
		return src.indexOf('apiKey') > -1 && src.match(/bugsense/);
	}
});

//next get the API key
var apiKey = thisScriptSrc.match(/apiKey=([^\&]+)/)[1];


sendBug(new Error("hello world!"), apiKey);




