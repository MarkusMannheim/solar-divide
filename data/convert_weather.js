const d3 = require("d3"),
      fs = require("fs");

fs.readFile("station_solar_data.csv", "utf8", function(error, data) {
  data = d3.csvParse(data);
  data = data
    .map(function(d) {
      return {
        type: "Feature",
        properties: {
          solarExposure: +d.solar_exposure
        },
        geometry: {
          type: "Point",
          coordinates: [+d.lng, +d.lat]
        }
      };
    });
  data = {
    type: "FeatureCollection",
    features: data
  };
  fs.writeFile("stationSolarData.geojson", JSON.stringify(data), function(error) {
    console.log("stationSolarData.geojson written");
  });
});
