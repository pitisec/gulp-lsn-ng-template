var es = require('event-stream');
var path = require('path');
var _ = require('underscore');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');

function htmlJsStrLsn(string) {
  return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
    switch (character) {
      case '"':
      case "'":
      case '\\':
        return '\\' + character
      case '\n':
        return '\\n\' +\n\''
      case '\r':
        return '\\r'
      case '\u2028':
        return '\\u2028'
      case '\u2029':
        return '\\u2029'
    }
  })
}

function templateCache(options) {
  return es.map(function(file, callback) {
    var template = '$templateCache.put(\'<%= url %>\',\'<%= contents %>\');';
    var url;

    file.path = path.normalize(file.path);

    if(typeof options.path === 'function') {
      url = path.join(options.path(file.path, file.base));
    } else {
      url = path.join(file.path);
      url = url.replace(file.base, '');
    };

    if (process.platform === 'win32') {
      url = url.replace(/\\/g, '/');
    }

    var contents = file.contents;

    /**
     * HTML to JavaScript
     */
    contents = htmlJsStrLsn(contents);

    file.contents = new Buffer(gutil.template(template, {
      url: url,
      contents: contents,
      file: file
    }));

    callback(null, file);
  });
}

module.exports = function(options) {
  var defaults = {
    standalone: false,
    module: 'templates',
    filename: 'templates.min.js',
    header: 'angular.module(\'<%= module %>\'<%= standalone %>).run([\'$templateCache\', function($templateCache) {',
    footer: '}]);'
  };

  if(!options) {
    options = {};
  } else if(typeof options === 'string') {
    options = {
      module: options
    };
  }

  if(arguments[1] && typeof arguments[1] === 'string') {
    options.filename = arguments[1];
  }

  options = _.extend(defaults, options);
  
  return es.pipeline(
    templateCache(options),
    concat(options.filename),
    header(options.header, {
      module: options.module,
      standalone: (options.standalone ? ', []' : '')
    }),
    footer(options.footer)
  );
};