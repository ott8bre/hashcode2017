/* Scoring
The score is the average time saved per request, in microseconds. (Note that the latencies in the input file
are given in milliseconds. The score is given in microseconds to provide a better resolution of results.)

For each request description in the input file, we choose the best way to stream the video R v (Rv, Re, Rn) to
the endpoint R e . We pick the lowest possible latency , where L D L = min(LD, L0, ... , Lk−1) is the latency of
serving a video to the endpoint R e from the data center, and L0, ... , Lk−1 are latencies of serving a video to
the endpoint R e from each cache server that:
● is connected to the endpoint R e , and
● contains the video R v
The time that was saved for each request is LD − L (This is the time it would take to stream the video from
the data center, minus the time it actually took. If the video is in fact streamed from the data center, the time
saved is 0.)
As each request description describes R n requests, the time saved for the entire request description is
Rn × (LD − L) .
To compute the total score for the data set, we sum the time saved for individual request descriptions in
milliseconds, multiply by 1000 and divide it by the total number of requests in all request descriptions,
rounding down. */

function score(game){

  var caches_for_video = [];
  game.caches.forEach(function(r){
    Object.keys(r.videos).forEach(function(id){
      caches_for_video[id] = caches_for_video[id] || [];
      caches_for_video[id].push(r.id);
    });
  });

  //var caches_hit_real = [];

  var total_saved_ms = 0;
  var total_requests = 0;
  game.requests.forEach(function(r){
    //console.error(r);
    var e = game.endpoints[r.endpoint_id];
    //console.error(e);
    var caches_hit = e.caches.filter(function(item){
      return caches_for_video[r.video_id] && caches_for_video[r.video_id].indexOf(item.id) != -1;
    }).sort(function(a,b){
      return +1*( a.latency - b.latency );
    });
    //console.error(caches_hit);

    total_requests += r.requests_number;
    var c = caches_hit[0];
    if( c ){
      var s = e.latency - c.latency;
      var n = r.requests_number;
      total_saved_ms += s*n;

      game.caches[c.id].videos[r.video_id] = true;
      //game.caches[c.id].hitted = game.caches[c.id].hitted || [] 
      //game.caches[c.id].hitted.push(r.video_id);
    }

  });

//console.error( game.caches );
  return Math.floor(1000 * total_saved_ms / total_requests);
}

module.exports = { score: score };

