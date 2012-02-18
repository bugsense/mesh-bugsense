module.exports = function(search) {
	var scripts = document.getElementsByTagName('script');  

	for(var i = scripts.length; i--;)
	{
		var script = scripts[i]; 
		
		if(script.src && search.test(script.src))
		{
			return script.src;
		}
	}           
}