var start = new Date();

var util = require('util');
var fs  = require("fs");
var path  = require("path");

var loader = require("./loader");
var solver = require("./solver");

// Check parameters
if (process.argv.length < 3) {
	console.log("Parameters: <FILE_INPUT>");
	process.exit(1);
}

var filepath = process.argv[2];

var game = loader.load (filepath);
console.error("loaded: "+filepath);
console.error(game.videos_number+" videos");
console.error(game.endpoints_number+" endpoints");
console.error(game.requests_number+" requests");
console.error(game.caches_number+" caches, "+game.cache_size+"MB each");

solver.solve (game);
console.error("solved: "+filepath);

// Print Results
console.log(game.caches.length);
game.caches.map(function(i){
    console.log(i.id +" "+ Object.keys(i.videos).join(' '));
});

console.error("duration: %dms", new Date() - start);
console.error("   score: %d", game.score);
process.exit(0);
