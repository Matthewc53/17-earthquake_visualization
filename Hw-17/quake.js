jsonurl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

var earthquakes = L.layerGroup();

// Perform a GET request to the json
d3.json(jsonurl, function(data) {
  console.log(data)

  const clrz = d3.scaleLinear()
    .range(["steelblue", "crimson"])
    .domain(d3.extent(data.features, d => d.properties.mag))
    .interpolate(d3.interpolateLab);

  // Once we get a response, send the data.features object to the createFeatures function
  function markerStyle(feature) {
    return {
      radius: magRadius(feature.properties.mag),
      fillColor: clrz(feature.properties.mag),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }
  }

  function magRadius(mag) {
    if (mag === 0) {
      return 1;
    }
    return mag * 5
  }

  function colors(mag) {
    switch (true) {
      case (mag > 5):
        return 'green';
      case (mag > 4):
        return 'orange';
      case mag > 3:
        return 'lightblue';
      case mag > 2:
        return 'lightgreen';
      case mag > 1:
        return 'yellow';
    }
  }

  var geoStuff = L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, markerStyle(feature));
    },
    onEachFeature: onEachFeature
  })
  geoStuff.addTo(earthquakes);

  //
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  //  Create a GeoJSON layer containing the features array on the earthquakeData object
  //  Run the onEachFeature function once for each piece of data in the array
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>" + 'Magnitude: ' + feature.properties.mag + '</p>');
  }



  // Sending our earthquakes layer to the createMap function
  createMap(geoStuff);


  function createMap(geoStuff) {
    //
    //Define streetmap and darkmap layers
    var outdoormap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXNodWZmIiwiYSI6ImNqZ3ljNzR2ODAzcWUycXFsNnUyMDZ2OXUifQ.pqYlbNcVTTFN8WJTye_OqA');
    //


    var myMap = L.map("map", {
      center: [
        0, -0
      ],
      zoom: 2.6,
      layers: [earthquakes, outdoormap]
    });

    //
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Outdoor": outdoormap,
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };

    var legend = L.control({
      position: 'bottomright'
    });

    legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5],
        labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        console.log(grades[i], grades[i + 1])
        div.innerHTML +=
                    '<i style="background:' + clrz(grades[i] + 0.1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                  }

      return div;
    };

    legend.addTo(myMap);

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  }
});
