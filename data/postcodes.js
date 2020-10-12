const d3 = require("d3"),
      fs = require("fs");

fs.readFile("poa.geojson", "utf8", function(error, data) {
  if (error) throw error;
  geoData = JSON.parse(data)
    .features
    .map(function(d) {
      d.properties = { postcode: d.properties.POA_NAME16 };
      return d;
    });
  fs.readFile("./solarData/final_postcodes.csv", "utf8", function(error, data) {
    if (error) throw error;
    pcData = d3.csvParse(data);
    pcData = pcData
      .map(function(d) {
        d.income = d.income.replace("$", "").replace(",", "");
        pcData.columns.slice(1)
          .forEach(function(e) {
            d[e] = +d[e];
          });
        return d;
      });
    finalJson = [];
    pcData.forEach(function(d) {
      let feature = geoData
        .filter(function(e) { return e.properties.postcode == d.postcode; });
      if (feature.length == 1) {
        finalJson.push({
          type: "Feature",
          geometry: feature[0].geometry,
          properties: d
        });
      }
    });
    finalJson = {
      type: "FeatureCollection",
      features: finalJson
    };
    fs.writeFile("postcodes.geojson", JSON.stringify(finalJson), function(error) {
      console.log("postcodes.geojson written");
    });
  });
});
