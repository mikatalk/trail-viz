"use strict";

import '../assets/css/main.scss';

import FR from './FileReader';
import Main from './Main';
import polyline from 'polyline';

FR
.load('assets/data/paths.json')
.then( function(response) {

    console.log("[app.js] ready with", response.length, 'paths loaded');
	var paths = [];
	for ( var path of response ) {
		var latLon = polyline.decode(path[0]);
		var elevaSpeed = polyline.decode(path[1]);
		paths.push([]);
		for ( var i=0,l=latLon.length; i<l; i++ ) {
			paths[paths.length-1].push([
				latLon[i][0],
				latLon[i][1],
				elevaSpeed[i][0],
				elevaSpeed[i][1]
			]);
		}
	}

    var app = new Main(paths);

}, function(error) {
    console.error("Failed!", error);
});

