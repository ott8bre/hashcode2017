var exports = module.exports = {};

var util = require('util');
var fs  = require("fs");

function read_lines(filename){
	var lines = [];
	fs.readFileSync(filename).toString().split('\n').forEach(function (line) { 
		lines.push(line);
	});
	return lines;
}

// Loading data
function load (filename) {
	var lineCounter = 0;
	var words = [];
	var lines = read_lines(filename);

	words = lines[lineCounter ++].split(' ');

	// Load header
	var model = {
		videos_number: +words[0],
		endpoints_number:  +words[1],
		requests_number:  +words[2],
		caches_number:  +words[3],
		cache_size:  +words[4],
		video_sizes:  [],
		endpoints:  [],
		requests:  []
	};

	// Load video dimensions
	words = lines[lineCounter ++].split(' ');
	for (var i = 0; i < model.videos_number; ++i) {
		model.video_sizes[i] = +words[i];
	}

	// Load data Enpoints
	for (var i=0; i < model.endpoints_number; ++i) {
		words = lines[lineCounter ++].split(' ');
		model.endpoints[i] = {
			id: i,
			latency: +words[0],
			caches_number: +words[1],
			caches: []
		};
		for (var j=0; j < model.endpoints[i].caches_number; ++j) {
			words = lines[lineCounter ++].split(' ');
			model.endpoints[i].caches[j] = {
				id: +words[0],
				latency: +words[1],
				saved_ms: model.endpoints[i].latency - words[1],		
			};
		}		
	}

	// Load data Requests
	for (var i=0; i < model.requests_number; ++i) {
		words = lines[lineCounter ++].split(' ');
		model.requests[i] = {
			id: i,
			video_id: +words[0],
			endpoint_id: +words[1],
			requests_number: +words[2]
		};
	}

	//console.error( JSON.stringify(model, null, ' ') );
	return model;
}

module.exports = { load: load};
