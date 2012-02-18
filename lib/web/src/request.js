var qs = require('querystring');

var _cbCount = 0;

module.exports = function(url, options, callback) {


	if(options.query) url = url + "?" + qs.stringify(options);


	var _cbName = "_" + Date.now() + "_cb" + (_cbCount++);

	window[_cbName] = function(result) {
		var p = JSON.parse(result.query.results.body.p);
		console.log(p)
	}

 
    var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + url + '"\n postdata="abc"\n ') + '&format=json&callback=' + _cbName;  
  		
  	console.log(yql)

    var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('script');
	script.type= 'text/javascript';
	script.src = yql; 
	head.appendChild(script);
  
    
}
