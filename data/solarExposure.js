const d3 = require("d3"),
      fs = require("fs");

fs.readFile("poa.geojson", "utf8", function(error, data) {
  if (error) throw error;
  geoData = JSON.parse(data)
    .features
    .filter(function(d) {
      return d.properties.AREASQKM16 > 0;
    })
    .map(function(d) {
      d.properties = { postcode: d.properties.POA_NAME16 };
      return d;
    });
  fs.readFile("filtered_postcodes.csv", "utf8", function(error, data) {
    postcodes = d3.csvParse(data)
      .map(function(d) { return d["0"].toString().padStart(4, "0"); });
    fs.readFile("station_solar_data.csv", "utf8", function(error, data) {
      stations = d3.csvParse(data)
        .map(function(d) {
          return {
            site: d.site,
            solarExposure: +d.solar_exposure,
            coordinates: [+d.lng, +d.lat]
          };
        });
      solarCodes = [];
      postcodes.forEach(function(d) {
        let postcode = d;
        let geoDatum = geoData
          .filter(function(e) {
            return e.properties.postcode == postcode;
          })[0];
        let centroid = d3.geoCentroid(geoDatum);
        let tempStations = stations
          .map(function(e) {
            e.distance = d3.geoDistance(e.coordinates, centroid);
            return e;
          });
        tempStations.sort(function(a, b) {
          return d3.ascending(a.distance, b.distance);
        });
        let solarExposure = tempStations[0].solarExposure;
        solarCodes.push({
          postcode: postcode,
          solarExposure: solarExposure
        });
      });
      fs.writeFile("./solarData/solar_exposure.csv", d3.csvFormat(solarCodes), function(error) {
        console.log("solar_exposure.csv written");
      });
    });
  });
});
