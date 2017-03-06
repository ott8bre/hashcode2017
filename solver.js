var exports = module.exports = {};

var readline = require('readline');
var util = require('util');
var _ = require('lodash');

var scorer = require("./scorer");

function progress(str){
    readline.cursorTo(process.stderr, 0);
    process.stderr.write(str);
}
/*
function requestsSort(game){

//    return game.requests.sort(function(a, b) {
//        return -1 * (a.requests_number - b.requests_number);
//    });

    return game.requests.sort(function(a, b) {
        return +1 * (game.video_sizes[a.video_id] - game.video_sizes[b.video_id]);
    });
    
}

function cachesSort(game){

    var temp = [];
    game.endpoints.forEach(function(e){
        e.caches.forEach(function(c){
            id = c.id;
            temp[id] = temp[id] || [];
            temp[id].push(c.latency); 
        });
    });
    
    var xxx = temp.map(function(arr,a){
        var avgLatency = arr.reduce(function(acc, val) {
            return acc + val;
        }, 0) / arr.length;
        return {id: a, latency: avgLatency, videos: []};
    });

    return xxx.sort(function(a, b) {
        return +1 * (a.latency - b.latency);
    });

}

function solve0(game) {

    var sortedRequests = requestsSort(game);
    var sortedCaches = cachesSort(game);

    var total = sortedCaches.length;
    var count=0;
    sortedCaches.forEach(function(c){
        console.error( (count++) + " of "+total+" \r");
        sortedRequests.forEach(function(r){
            var e = game.endpoints[r.endpoint_id];
            var cache = e.caches[c.id];
            if(c && !r.done){
                // esiste link e-c
                if(c.videos.indexOf(r.video_id) == -1){
                    var size = c.videos.reduce(function(acc, val) {
                        return acc + game.video_sizes[val];
                    }, 0);
 
                    var cacheFreeSpace = game.cache_size - size;
                    if(cacheFreeSpace >= size){
                        c.videos.push(r.video_id);
                        r.done = true;
                    }
                }
            }

        });
    });

	return sortedCaches;
}
*/

function groupRequestsByCache(game){
    var count=0;
    var cache_requests = [];
    game.requests.forEach(function(r){
        if(count%1000 === 0) progress( (++count) + " of "+game.requests_number);

        var e = game.endpoints[r.endpoint_id];
        e.caches.forEach(function(c){
            cache_requests[c.id] = cache_requests[c.id] || {};
            cache_requests[c.id][r.video_id] = cache_requests[c.id][r.video_id] || {
                id: r.video_id,
                size: game.video_sizes[r.video_id], 
                //total_requests: 0,
                total_saved_ms: 0
            };
            //cache_requests[c.id][r.video_id].total_requests += r.requests_number;
            cache_requests[c.id][r.video_id].total_saved_ms += (r.requests_number * c.saved_ms);
        });

    });
    return cache_requests;
}

// SIMPLIFICATION: PROCESS EACH CACHE SEPARATELY
function solve1(game) {

    var cache_requests = groupRequestsByCache(game);

    var count=0;
    var candidates = cache_requests.map(function(item, index){
        progress( (++count) + " of "+game.caches_number);

        return _.values(item)
        .sort(function(a,b){
            return -1 * (a.total_saved_ms/a.size - b.total_saved_ms/b.size);
        })
        .reduce(function(acc, val) {
            var new_size = acc.size + val.size;
            if(new_size <= game.cache_size){
                acc.videos.push(val.id);
                acc.size += val.size;
                acc.total_saved_ms += val.total_saved_ms;
            }
            return acc;
        }, {id: index, videos:[], size:0, total_saved_ms: 0})
        ;
    });
    progress("");

    game.caches = candidates;

}

function solve2(game) {
    game.caches = [];

    // 1. NO LIMIT CACHE
    game.requests.forEach(function(r){
        game.endpoints[r.endpoint_id].caches.forEach(function(c){
            game.caches[c.id] = game.caches[c.id] || {id: c.id, videos: {}, size: 0};
            game.caches[c.id].videos[r.video_id] = false;
            game.caches[c.id].size += game.video_sizes[r.video_id];
        });    
    });
/*
    return _.range(0, game.caches_number).map( function(cid){
        return {id: cid, videos: _.range(0, game.videos_number)};
    } );
*/
    // 2. REMOVE UNUSED

    // 3. SHAVING

    // 4. OPTIMIZATION

    // 5. SCORING
    game.score = scorer.score(game);
}

module.exports = { solve: solve2 };
