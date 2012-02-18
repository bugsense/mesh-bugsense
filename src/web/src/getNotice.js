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