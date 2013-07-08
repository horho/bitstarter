/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var url = require('url');
var util = require('util');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://desolate-caverns-1625.herokuapp.com/";

var assertFileExists = function(infile) {
  var instr = infile.toString();
	console.log("Assert URL:"+util.inspect({inurl: inurl, outfile: outFile, checkFile: checkFile}));
	console.log("Assert File: "+util.inspect({infile: infile}));
	if(!infile) return false;
   if(!fs.existsSync(instr)) {
       console.log("%s does not exist. Exiting.", instr);
       process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
   }
   return instr;
};
	
var assertURLExists =	function(inurl, outFile, checkFile) {
	console.log("Assert URL:"+util.inspect({inurl: inurl, outfile: outFile, checkFile: checkFile}));
	var now = new Date();
	outFile = "index-"+now.toJSON()+".html";
	rest.get(inurl).on('complete', function(result) {
		if (result instanceof Error) {
        console.error('Error: ' + util.format(result.message));
		} else {
			console.log("URL = "+inurl+" Write "+outFile); 
			fs.writeFileSync(outFile, result);
			checkJson = checkHtmlFile(htmlFile, program.checks);
		}
	});
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
		var htmlFile = HTMLFILE_DEFAULT;
		var checkJson = "";
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', function(htmlFile, checkJson) {
					if(!fs.existsSync(htmlFile)) { 
						console.log("%s does not exist. Exiting.", htmlFile); 
						process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
					}
					checkJson = checkHtmlFile(htmlFile, program.checks);
					console.log("Check file "+htmlFile); 
					var outJson = JSON.stringify(checkJson, null, 4); 
					console.log(outJson); 
				})
        .option('-u, --url <URL>', 'URL to index.html', function(inurl, htmlFile, checkJson) {
					var now = new Date();
					htmlFile = "index-URL.html";
					rest.get(inurl).on('complete', function(result) {
						if (result instanceof Error) { 
							console.error('Error: ' + util.format(result.message)); 
							process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
						} else {
							console.log("URL = "+inurl+" Write "+htmlFile); 
							fs.writeFileSync(htmlFile, result);
							checkJson = checkHtmlFile(htmlFile, program.checks);
							console.log("Check URL "+inurl+" file: "+htmlFile); 
							var outJson = JSON.stringify(checkJson, null, 4); 
							console.log(outJson);
							}
						});
					})
        .parse(process.argv);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
