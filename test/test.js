var assert = require('assert');
var es = require('event-stream');
var File = require('vinyl');
var ngTemplates = require('../index');
var path = require('path');

describe('gulp-lsn-ng-templates', function () {
	it('should build html templates with breaks on every \\n', function (done) {
		var file, contents;

		contents = '<div class="row">\n<div class="large-12 columns">\n</div>\n</div>';
		// contents = 'a\na';
		file = new File({
			path: path.join(__dirname, 'template-1.html'),
			base: path.join(__dirname),
			contents: new Buffer(contents)
		});

		var stream = ngTemplates('moduleName', 'templates.js');

		stream.on('data', function (file) {
			assert(!file.isStream());
			assert.equal(file.contents.toString('utf-8'), 'angular.module(\'moduleName\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-1.html\',\'<div class=\\"row\\">\\n\' +\n\'<div class=\\"large-12 columns\\">\\n\' +\n\'</div>\\n\' +\n\'</div>\');}]);');
			// assert.equal(file.contents.toString('utf-8'), 'angular.module(\'moduleName\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-1.html\',\'a\\n\' +\n\'a\');}]);');
			assert.equal(file.path.replace(file.base + '/', ''), 'templates.js');
			done();
		});

		stream.write(file);

		stream.end();
	});
});