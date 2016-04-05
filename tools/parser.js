
/**____________________________________________**/
/** Run parse and replace the constants below: **/
const MIN_SPEED = 0 
    , MAX_SPEED = 19.23 
    , MIN_ELEVATION = 27.4 
    , MAX_ELEVATION = 123.9;
/**____________________________________________**/

var W = 512
  , fs = require('fs')
  , Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(W, W)
  , ctx = canvas.getContext('2d')
  , rl = require('readline')
  , _ = require('lodash')
  , polyline = require('polyline');


ctx.beginPath();
ctx.rect(0, 0, W, W);
ctx.fillStyle = "white";
ctx.fill();

function drawPoint (x, y, r, g, b, a) {
    ctx.strokeStyle = 'rgba('+r+','+g+','+b+','+a+')';
    ctx.beginPath();
    ctx.rect(x-1, y-1, 2, 2);
    ctx.stroke();
}


var radius = 0.0055
  , lonMin = -118.3854
  , lonMax = lonMin+radius
  , latMin = 34.0155
  , latMax = latMin+radius
  , paths = []
  , minElevation = Number.MAX_VALUE
  , maxElevation = 0
  , minSpeed = Number.MAX_VALUE
  , maxSpeed = 0;

var point;
var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                       results = results.concat(res);
                       next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

var KEYS = [  
/*  0 */    'time',
/*  1 */    'activityType',
/*  2 */    'lapNumber',
/*  3 */    'distance',
/*  4 */    'speed',
/*  5 */    'calories',
/*  6 */    'lat',
/*  7 */    'long',
/*  8 */    'elevation',
/*  9 */    'heartRate',
/* 10 */    'cycles'
];



walk(__dirname + '/../csv-logs', function(err, results) {
    
    if (err) throw err;

    console.log('filtering csv files...')

    results = _.filter(results, function(result) { 
        return result.slice(-4) === '.csv'; 
    });
    
    filterByGPSLocation(results);

});



function filterByGPSLocation (results) {

    function processOne(index) {

        if ( index >= results.length-1 ) {
            return scanComplete( paths );
        }

        var csv = fs.readFileSync(results[index], 'utf-8');
        var lines = csv.split('\n');
        if ( lines[0] !== KEYS.join(',') ) {
            console.log('wrong cell formating, skipping...', results[index]);
            return processOne(index+1);
        }

        var vars = lines[1].split(',')
          , lat
          , lon
          , speed
          , elevation
          , pathLatLon = []
          , pathElevationSpeed = []
          , isInBounds = false;

        for ( var i=1, l=lines.length-1; i<l; i++ ) {

            vars = lines[i].split(',')

            if ( vars.length > 8 
                && vars[6].length > 1
                && vars[7].length > 1
                && vars[8].length > 1
                && vars[4].length > 1
            ) {
            
                lat = parseFloat(vars[6]),
                lon = parseFloat(vars[7]);
                speed = parseFloat(vars[4]);
                elevation = parseFloat(vars[8]);

                if ( lat > latMin && lat < latMax && lon > lonMin && lon < lonMax ) {
                   
                    // calculate min and max
                    if ( speed < minSpeed ) minSpeed = speed;
                    else if ( speed > maxSpeed ) maxSpeed = speed;
                    if ( elevation < minElevation ) minElevation = elevation;
                    else if ( elevation > maxElevation ) maxElevation = elevation;

                    // test data
                    lon = (1-(lon-lonMin)/radius).toFixed(5);
                    lat = ((lat-latMin)/radius).toFixed(5);
                    if ( lat < 0 || lat > 1 || lon < 0 || lon > 1 ) 
                        console.log(lat, lon);
                    elevation = ( (elevation - MIN_ELEVATION) / (MAX_ELEVATION - MIN_ELEVATION) ).toFixed(5);
                    speed = ( (speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED) ).toFixed(5);
                    if ( elevation < 0 || elevation > 1 || speed < 0 || speed > 1 ) 
                        console.log('WRONG MIN/MAX variables!!', elevation, speed);
        
                    // draw debug picture
                    drawPoint(lon*W, lat*W, 
                        255-100*elevation,
                        100*elevation,
                        100+155*elevation,
                        .1
                    );
                    
                    // organize the data by pair to encode as polyline (from 6mb to 1.4mb)
                    pathLatLon.push([ lat, lon ]);
                    pathElevationSpeed.push([ elevation, speed ]);

                    isInBounds = true;
                }
            }
        }
        if ( isInBounds ) paths.push( [ polyline.encode(pathLatLon), polyline.encode(pathElevationSpeed) ] );
        else console.log(results[index], 'out of bounds');
        return processOne(index+1);
    }
    processOne(0)
}

function scanComplete(paths){
        console.log('Scan complete, found', paths.length, 'paths');

            console.log('________________________________________________________________________'
                + '\nUpdate parser.js with the values below and run it again:'
                , '\nvar MIN_SPEED =', minSpeed
                , '\n  , MAX_SPEED =', maxSpeed
                , '\n  , MIN_ELEVATION =', minElevation
                , '\n  , MAX_ELEVATION =', maxElevation+';'
                , '\n________________________________________________________________________' );

            // save:
            var file = fs.createWriteStream(__dirname + '/paths.json');
            file.write( JSON.stringify( paths ));
            file.end();

            var out = fs.createWriteStream(__dirname + '/preview.png')
              , stream = canvas.pngStream();

            stream.on('data', function(chunk){
              out.write(chunk);
            });

            stream.on('end', function(){
              console.log('Polylines exported to paths.txt.\nClosing...');
            });

    }