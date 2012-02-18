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