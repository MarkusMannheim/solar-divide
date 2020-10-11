const d3 = require("d3"),
      fs = require("fs");

fs.readFile("poa.geojson", "utf8", function(error, data) {
  if (error) throw error;

  data = JSON.parse(data)
    .features;

  data = data
    .filter(function(d) { return d.properties.AREASQKM16 > 0; });

  data = data
    .map(function(d) {
      d.properties = { postcode: +d.properties.POA_NAME16 };
      return d.properties;
    });

  fs.writeFile("valid_postcodes.csv", d3.csvFormat(data), function(error) {
    console.log("valid_postcodes.csv written");
  });
});
