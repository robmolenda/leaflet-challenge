   // Initialize the map
   let myMap = L.map("map", {
    center: [20, 0],
    zoom: 2
});

// Add a tile layer to the map (OpenStreetMap tiles)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
    createFeatures(data.features);
});

// Function to create map features
function createFeatures(data) {
    // Function to return color based on depth
    function markerColor(depth) {
        return depth > 90 ? '#8D1E06' :
               depth > 70 ? '#CB840F' :
               depth > 50 ? '#F0A72F' :
               depth > 30 ? '#E1E716' :
               depth > 10 ? '#C7ED1D' :
               depth > -10 ? '#7BF41C' :
                            '#7BF41C';
    }

    // Function to define radius of earthquake marker
    function getRadius(magnitude) {
        return magnitude * 4;
    }

    // Parse JSON data to create map features
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "black",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.5
            });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
        }
    }).addTo(myMap);

    // Add legend to map
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend'),
            depth = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += '<h4>Depth (km)</h4><br>';

        for (let i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}