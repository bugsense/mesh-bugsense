var __app = (function(){
	var _sardines = (function()
{
	var nodeRequire,
	allFiles = {};

	var moduleDoesntExist = function(path)
	{
		throw new Error('Module '+ path + ' does not exist');
	}


	if(typeof require == 'undefined')
	{
		nodeRequire = function(path)
		{
			moduleDoesntExist(path);
		}


		nodeRequire.resolve = moduleDoesntExist;
	}
	else
	{
		nodeRequire = require;
	}

	var register = function(path, moduleFactory)
	{

		path = normalizePath(path);
		addPathToTree(path);

		_sardines.moduleFactories[path] = moduleFactory,
		dir = dirname(path);

		return moduleFactory;
	}

	var addPathToTree = function(path) {

		var curTree = allFiles, prevTree = allFiles,
		parts = path.split('/'),
		part;

		for(var i = 0, n = parts.length; i < n; i++) {
			part = parts[i];
			if(!curTree[part]) curTree[part] = { };
			curTree = curTree[part];
		}
	}

	var dirname = function(path)
	{
		var pathParts = path.split('/');
		pathParts.pop();
		return pathParts.join('/');
	}



	var req = function(path, cwd)
	{
		var fullPath = req.resolve(path, cwd ? cwd : '/');

		if(_sardines.modules[fullPath]) return _sardines.modules[fullPath];

		var factory = _sardines.moduleFactories[fullPath];

		if(!factory)
		{
			//could be a core function - try it.
			if(typeof require != 'undefined') return nodeRequire(path);

			moduleDoesntExist(fullPath);
		}

		var module = { exports: { } };

		var cwd = fullPath.match(/\.js$/) ? dirname(fullPath) : fullPath,
		modRequire = function(path)
		{
			return req(path, cwd);
		}

		modRequire.resolve = req.resolve;
		modRequire.paths = [];

		factory(modRequire, module, module.exports, cwd, fullPath);

		return _sardines.modules[fullPath] = module.exports;
	}

	function normalizeArray(v, keepBlanks) {
		var L = v.length,
		dst = new Array(L),
		dsti = 0,
		i = 0,
		part, negatives = 0,
		isRelative = (L && v[0] !== '');
		for (; i < L; ++i) {
			part = v[i];
			if (part === '..') {
				if (dsti > 1) {
					--dsti;
				} else if (isRelative) {
					++negatives;
				} else {
					dst[0] = '';
				}
			} else if (part !== '.' && (dsti === 0 || keepBlanks || part !== '')) {
				dst[dsti++] = part;
			}
		}
		if (negatives) {
			dst[--negatives] = dst[dsti - 1];
			dsti = negatives + 1;
			while (negatives--) {
				dst[negatives] = '..';
			}
		}
		dst.length = dsti;
		return dst;
	}

	function normalizePath(path) {
		return normalizeArray(path.split("/"), false).join("/");
	}

	function relateToAbsPath(path, cwd)
	{
		//root
		if(path.substr(0, 1) == '/') return path;

		//relative
		if(path.substr(0, 1) == '.') return cwd + '/' + path;

		return path;
	}

	function findModulePath(path)
	{
		var tryPaths = [path, path + '/index.js', path + '.js'],
		modulePaths = ['modules',''];


		for(var j = modulePaths.length; j--;)
		{
			for(var i = tryPaths.length; i--;)
			{
				var fullPath = normalizePath('/'+modulePaths[j]+'/'+tryPaths[i]);
				
				if(_sardines.moduleFactories[fullPath]) return fullPath;
			}
		}		
	}

	req.resolve = function(path, cwd)
	{
		return findModulePath(normalizePath(relateToAbsPath(path, cwd))) || nodeRequire.resolve(path);
	}

	return {
		allFiles: allFiles,
		moduleFactories: { },
		modules: { },
		require: req,
		register: register
	}
})();

_sardines.register("/modules/bugsense/src/index.js", function(require, module, exports, __dirname, __filename) {
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





});
_sardines.register("/modules/bugsense/src/getScript.js", function(require, module, exports, __dirname, __filename) {
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
});
_sardines.register("/modules/bugsense/src/sendBug.js", function(require, module, exports, __dirname, __filename) {
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
});
_sardines.register("/modules/bugsense/src/request.js", function(require, module, exports, __dirname, __filename) {
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

});
_sardines.register("/modules/bugsense/src/getNotice.js", function(require, module, exports, __dirname, __filename) {
	var getMessage = require('./getMessage'),
escapeText     = require('./escapeText');

module.exports = function(error) {
	return getMessage({
		url: window.location.href,
		error: error,
		app: {
			version: window.navigator.userAgent,
			os: window.navigator.os
		},
		custom_data: {
	        // You can remove & add custom data here from session/localStorage, cookies, geolocation, language, mimetypes,…
	        document_referrer    : escapeText(document.referrer),
	        http_status          : escapeText(this.status),
	        navigator_user_agent : escapeText(navigator.userAgent),
	        navigator_platform   : escapeText(navigator.platform),
	        navigator_vendor     : escapeText(navigator.vendor),
	        navigator_language   : escapeText(navigator.language),
	        screen_width         : escapeText(screen.width),
	        screen_height        : escapeText(screen.height),
	        request              : {}
	      }
	});
}
});
_sardines.register("/modules/bugsense/src/getMessage.js", function(require, module, exports, __dirname, __filename) {
	var generateBackTrace = require('./generateBackTrace');

module.exports = function(notice) {

	if(!notice.settings) notice.settings = {};

	var appVersion = notice.app.version,
	os             = notice.app.os,
	modelType      = notice.settings.modelType,
	error          = notice.error,
	custom_data    = notice.custom_data || {},
	url            = notice.url;

	custom_data.request = {};

	var data = {

      // basic data (required)
      application_environment: {
        environment: 'development', // modify me if you like
        // TODO: find a way to detect the mobile device, maybe with WURFL or so…?
        appver: appVersion || 'unknown',
        osver: os || 'unknown'
      },

      // bugsense client
      client: {
        name : 'SC Mobile Bugsense Notifier',
        protocol_version: 1,
        version: '0.1'
      },

      // basics about the exception
      exception: {
        klass: modelType || 'Unknown Component',
        message: error.message,
        backtrace: generateBackTrace(error.stack),
        where:"n/a:0" // can't take this out or the API breaks.
      }
    };

    var request = data.request = {
      // Collecting IPs is illegal in some countries that's why we don't do it, if you'd like to, just remove this ligne
      remote_ip: '0.0.0.0',
      url: url,
      custom_data: custom_data
    };
    if (notice.settings) {
      var req = notice.settings;

      for(var key in req) {
      	var vaue = req[key];
      	if(/boolean|number|string/.test(typeof value)) {
         request.custom_data.request[key] = value;
      	}
      }

    }
    // stringify it
    request.custom_data.request = JSON.stringify(request.custom_data.request);
    
    return data;
}
});
_sardines.register("/modules/bugsense/src/generateBackTrace.js", function(require, module, exports, __dirname, __filename) {
	var escapeText = require('./escapeText');

module.exports = function(stack) {
    if (stack) {
      return stack.file + ':' + stack.line;
    }

    var matcher = /\s+at\s(.+)\s\((.+?):(\d+)(:\d+)?\)/,
    parts = stack.split("\n").slice(4);

    console.log(parts);

    return;

    /*try {
      throw new Error();
    } catch (e) {
      if (e.stack) {
        var matcher = /\s+at\s(.+)\s\((.+?):(\d+)(:\d+)?\)/;
        return $.map(e.stack.split("\n").slice(4), _.bind(function(line) {
          var match  = line.match(matcher);
          var method = escapeText(match[1]);
          var file   = escapeText(match[2]);
          var number = match[3];
          return file + ':' + number + 'in' + method;
        }, this)).join("\n");
      } else if (e.sourceURL) {
        // note: this is completely useless, as it just points back at itself but is needed on Safari
        // keeping it around in case they ever end up providing actual stacktraces
        return e.sourceURL + ':' + e.line;
      }
    }
    return 'n/a:0';*/
  
}
});
_sardines.register("/modules/bugsense/src/escapeText.js", function(require, module, exports, __dirname, __filename) {
	module.exports = function(text) {
    return String(text || '').replace(/&/g, '&#38;')
               .replace(/</g, '&#60;')
               .replace(/>/g, '&#62;')
               .replace(/'/g, '&#39;')
               .replace(/"/g, '&#34;');
}
});
_sardines.register("/modules/querystring", function(require, module, exports, __dirname, __filename) {
	// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Query String Utilities

var QueryString = exports;


function charCode(c) {
  return c.charCodeAt(0);
}


QueryString.unescape = function(s, decodeSpaces) {
  return decodeURIComponent(s);////QueryString.unescapeBuffer(s, decodeSpaces).toString();
};


QueryString.escape = function(str) {
  return encodeURIComponent(str);
};

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};


QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  obj = (obj === null) ? undefined : obj;

  switch (typeof obj) {
    case 'object':
      return Object.keys(obj).map(function(k) {
        if (Array.isArray(obj[k])) {
          return obj[k].map(function(v) {
            return QueryString.escape(stringifyPrimitive(k)) +
                   eq +
                   QueryString.escape(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return QueryString.escape(stringifyPrimitive(k)) +
                 eq +
                 QueryString.escape(stringifyPrimitive(obj[k]));
        }
      }).join(sep);

    default:
      if (!name) return '';
      return QueryString.escape(stringifyPrimitive(name)) + eq +
             QueryString.escape(stringifyPrimitive(obj));
  }
};

// Parse a key=val string.
QueryString.parse = QueryString.decode = function(qs, sep, eq) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  qs.split(sep).forEach(function(kvp) {
    var x = kvp.split(eq);
    var k = QueryString.unescape(x[0], true);
    var v = QueryString.unescape(x.slice(1).join(eq), true);

    if (!obj.hasOwnProperty(k)) {
      obj[k] = v;
    } else if (!Array.isArray(obj[k])) {
      obj[k] = [obj[k], v];
    } else {
      obj[k].push(v);
    }
  });

  return obj;
};

});
var entries = ["modules/bugsense/src/index.js"],
	module = {};

for(var i = entries.length; i--;)
{
	var entry = _sardines.require(entries[i]);

	for(var property in entry)
	{
		module[property] = entry[property];
	}
}

return module;

})();


if(typeof module != 'undefined') module.exports = __app;