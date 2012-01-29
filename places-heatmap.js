/**
 * Heatmap Loader
 *
 * Based on a sample from the Nokia Maps API Playground
 * http://api.maps.nokia.com/2.1.0/playground/index.html?example=densityheatmap
 *
 * 2011 Simon Madine (@thingsinjars)
 * simon.madine@nokia.com
 */
var HH = {};

HH.HeatmapLoader = function () {
	"use strict";
	var self = this,
		map,
		mapLoad,
		heatmapLoad;

	// This creates and draws a basic static map
	mapLoad = function () {
		// Get the DOM node to which we will append the map
		var mapContainer = document.getElementById("map");
		// Create a map inside the map container DOM node
		self.map = new nokia.maps.map.Display(mapContainer, {
			// initial center and zoom level of the map
			center: [40, 5],
			zoomLevel: 2
		});
	};

	// This contains the various settings for the heatmap then
	// draws it ontop of the map
	heatmapLoad = function () {
		var heatmapProvider,
		    colorizeAPI;
		colorizeAPI = {
			/* Points on the heat map are colorized using the color-stops (range 0 - 1)
			 * The highest data points will get a color defined by 1 and the 
			 * the lower your data points get they will get a color defined by 0
			 */
			stops: {
				"0": "#E8680C",
				"0.25": "#F5A400",
				"0.5": "#FF9000",
				"0.75": "#FF4600",
				"1": "#F51F00"
			},
			// Whether we should interpolate between the stops to create a smooth color gradient
			interpolate: true
		};
		try {
			// Creating Heatmap overlay
			heatmapProvider = new nokia.maps.heatmap.Overlay({
				// How to color the heatmap
				colors: colorizeAPI,
				// This is the greatest zoom level for which the overlay will provide tiles
				max: 20,
				// This is the overall opacity applied to this overlay
				opacity: 1,
				// Defines if our heatmap is value or density based
				type: "density",
				// Coarseness defines the resolution with which the heat map is created.
				coarseness: 2
			});
		} catch (e) {
			// The heat map overlay constructor throws an exception if there
			// is no canvas support in the browser
			alert(e);
		}
		// Only start loading data if the heat map overlay was successfully created
		if (heatmapProvider && HH.tweetheatmap) {
			// Passing the data to the heat map
			heatmapProvider.addData(HH.tweetheatmap.allPlaces);
			// Rendering the heat map onto the map
			self.map.overlays.add(heatmapProvider);
		}
	};

	// Expose an interface to this object
	return {
		map: map,
		mapLoad: mapLoad,
		heatmapLoad: heatmapLoad
	};
};

// Create an instance of the HeatmapLoader
HH.heatmap = new HH.HeatmapLoader();