/**
 * Tweet Heatmap
 *
 * 2011 Simon Madine (@thingsinjars)
 * simon.madine@nokia.com
 */
HH.TweetHeatmap = function () {
	"use strict";
	var self,
		init,
		allPlaces = [],
		addPlaces,
		addSearch,
		tweetPlace,
		getLocation,
		addToPlace,
		futureCheck,
		futureCount = 0;

	init = function () {
		var locations, i;
		self = this;
		//Display a map first so the user isn't presented with a blank screen for too long.
		if (nokia.maps && HH.heatmap) {
			HH.heatmap.mapLoad();
		}

		// Set the subtitle
		document.getElementsByTagName('h2')[0].innerHTML = '#' + window.location.hash.substring(1);

		// Event Listener to reload the page if the hash changes (as this doesn't normally happen)
		window.addEventListener("hashchange", function (e) {window.location.reload(); }, false);

		// A list of locations distributed around the world so that we get an even amount of coverage
		// out of Twitter's geo search (which is ordered by distance from search center point)
		locations = [[0, 100], [0, 50], [0, 0], [0, 0], [0, -50], [0, -100], [0, -150], [50, 150], [50, 100], [50, 50], [50, 0], [50, 0], [50, -50], [50, -100], [50, -150], [-50, 150], [-50, 100], [-50, 50], [-50, 0], [-50, 0], [-50, -50], [-50, -100], [-50, -150]];

		// Show the loading animation while we find all the tweets
		document.getElementById('map-loading').style.display = 'block';

		// Loop through the list of locations and seatch the Twitter Search API for each
		for (i in locations) {
			self.addSearch(locations[i], window.location.hash.substring(1));
		}
	};

	// Take the coordinates passed in and the hashtag and make a JSONP call
	// to the Twitter Search API with the callback addPlaces
	addSearch = function (location, hashtag) {
		/**
		 * The search call specifies the following parameters:
		 * geocode - Centre the search on this location, providing it increases the number of results with a location
		 * q - the term to search for. We prepend withit with %23 - a URL encoded #
		 * rpp - the maximum number of results we want back
		 * callback - the function in this object to call when this returns
		 */
		var url = 'http://search.twitter.com/search.json?geocode=' + location[0] + ',' + location[1] + ',20000mi&q=%23' + hashtag + '&rpp=100&callback=HH.tweetheatmap.addPlaces',
		    script = document.createElement("script");
		script.setAttribute("src", url);
		document.body.appendChild(script);
	};

	// Loop through all the results data, retrieving location info for each
	addPlaces = function (data) {
		var i;
		if (data && data.results && data.results.length) {

			// This is to ensure that we don't call the functionality to load the heatmap too early
			// We increase the index of 'outstanding requests'
			self.futureCount += data.results.length;

			for (i = data.results.length - 1; i >= 0; i--) {
				if (data.results[i].location) {
					self.getLocation(data.results[i].location.replace('iPhone: ',''));
				} else {
					// If this call can't be geocoded, decrease the number of outstanding requests.
					self.futureCount--;
				}
			};
		}
	};

	// Make a JSONP call to the Nokia Maps geocode API for the provided place.
	getLocation = function (location) {
		/**
		 * The geocode call specifies the following parameters:
		 * q - location to geocode pulled from the tweet data
		 * to - 
		 * vi - 
		 * dv - 
		 * callback_func - the function in this object to call when this returns
		 */
		var url = 'http://where.desktop.mos.svc.ovi.com/json?q=' + encodeURI(location) + '&to=1&vi=address&dv=NokiaMapsAPI&callback_func=HH.tweetheatmap.addToPlace',
		    script = document.createElement("script");
		script.setAttribute("src", url);
		document.body.appendChild(script);
	};

	// If we've managed to successfully geocode this tweet, 
	// Add the location to the heatmap's data structure
	addToPlace = function (data) {
		if (data.results.length) {
			allPlaces.push({
				"latitude" : data.results[0].properties.geoLatitude, 
				"longitude" : data.results[0].properties.geoLongitude,
				"city" : data.results[0].properties.title,
				"country" : data.results[0].properties.addrCountryName
			});
		}

		// Are we ready to draw the heatmap yet?
		self.futureCheck();
	};

	// If all the async calls have returned, draw the heatmap.
	// Otherwise, decrease and try again later.
	futureCheck = function () {
		self.futureCount--;
		if (self.futureCount===0) {
			// Hide the loading animation now that we're done
			document.getElementById('map-loading').style.display = 'none';
			HH.heatmap.heatmapLoad();
		}
	};

	// Expose an interface
	return {
		init: init,
		addSearch: addSearch,
		addPlaces : addPlaces,
		addToPlace : addToPlace,
		getLocation: getLocation,
		futureCount : futureCount,
		futureCheck : futureCheck,
		allPlaces : allPlaces
	};
};
HH.tweetheatmap = new HH.TweetHeatmap();
HH.tweetheatmap.init();