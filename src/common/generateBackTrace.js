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