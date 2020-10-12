function drawPlanet() {
  planetSequence = 0;
  planet = container
    .append("svg")
      .attr("id", "planet")
      .on("click", clickPlanet);
  logo.style("background", "none")
    .raise()
    .style("pointer-events", "none");
  projection = d3.geoOrthographic()
    .translate(centre)
    .rotate([132, -26])
    .fitExtent([[100, 100], [width - 150 , height - 75]], {type: "Sphere"});
  maxScale = projection.scale();
  projection.scale(0);
  path = d3.geoPath()
    .projection(projection)
    .pointRadius(7.5);
  globe = planet
    .append("g")
      .attr("id", "globe");
  sphere = globe
    .append("path")
      .datum({type: "Sphere"})
      .attr("id", "sphere");
  graticule = globe
    .append("path")
      .datum(d3.geoGraticule())
      .attr("id", "graticule");
  land = globe
    .append("path")
      .datum(worldData)
      .attr("id", "land");
  planet.selectAll("path")
    .attr("d", path)
    .transition()
      .duration(4000)
      .attrTween("d", function(d) {
        let scaleTransition = d3.interpolate(0, maxScale * 4);
        let rotateTransition = d3.interpolate([0, 0], [-132, 26]);
        return function(t) {
          projection.scale(scaleTransition(t))
            .rotate(rotateTransition(t));
          return path(d);
        };
      });
  d3.timeout(showSolarExposure, 5000);
}

function showSolarExposure() {
  title = container
    .append("div")
      .classed("title", true)
      .text("weather stations")
      .style("opacity", 0);
  title.transition()
    .duration(2000)
    .style("opacity", 1);
  stations = globe
    .selectAll(".station")
      .data(stationData.features.sort(function(a, b) { return d3.ascending(a.properties.solarExposure, b.solarExposure); }))
    .enter().append("path")
      .classed("station", true)
      .attr("d", path);
  range = d3.extent(stationData.features.map(function(d) { return d.properties.solarExposure; }));
  colourScale = d3.scaleLinear()
    .range(["white", yellow, red])
    .domain([range[0], (range[0] + range[1]) / 2, range[1]])
    .interpolate(d3.interpolateHsl);
  stations.transition()
    .delay(function(d, i) { return 1000 / stationData.features.length * i; })
    .style("opacity", 1)
  .transition()
    .delay(3000)
    .style("fill", function(d) { return colourScale(d.properties.solarExposure); });
  d3.timeout(function() {
    legendScale = d3.scaleLinear()
      .range([height / 2 - 25, 25])
      .domain(range);
    buildLegend();
    legendTitle.text("solar exposure (MJ/m²)")
    drawLegend();
  }, 3000);
}

function buildLegend() {
  legend = container
    .append("svg")
      .attr("id", "legend")
      .style("width", "200px")
      .style("height", height / 2 + "px");
  legendTitle = legend
    .append("text")
      .attr("id", "legendTitle")
      .attr("x", 175)
      .attr("y", 12);
  legendAxisGroup = legend
    .append("g")
      .attr("id", "legendAxisGroup")
      .attr("transform", "translate(125, 0)");
  legendAxis = d3.axisLeft(legendScale)
    .ticks(5, ".0f")
    .tickSizeOuter(0);
  legend.append("rect")
    .attr("width", 50)
    .attr("height", (height / 2) - 50)
    .attr("x", 125)
    .attr("y", 25);
  colourScale.domain([0, .5, 1]);
  legend.append("defs")
    .append("linearGradient")
      .attr("id", "legendGradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "100%")
      .attr("y2", "0%")
      .selectAll("stop")
        .data(d3.range(11))
      .enter().append("stop")
        .attr("offset", function(d) { return d * 10 + "%"; })
        .attr("style", function(d) { return "stop-color: " + colourScale(d / 10) + "; stop-opacity: 1;"; });
}

function drawLegend() {
  legendAxisGroup.call(legendAxis);
  legend.transition()
    .duration(2000)
    .style("opacity", 1);
}

function removeStations() {
  clearLegend();
  stations.transition()
    .duration(1000)
    .style("opacity", 0)
    .remove();
  title.transition()
    .duration(1000)
    .style("opacity", 0)
    .remove()
    .on("end", showPostcodes);
}

function clearLegend() {
  legend.transition()
    .duration(1000)
    .style("opacity", 0)
    .remove();
}

function clickPlanet() {
  planetSequence = planetSequence + 1;
  if (planetSequence == 1) {
    removeStations();
  } else if (planetSequence == 2) {
    showExposure();
  } else if (planetSequence == 3) {
    clearLegend();
    showIncome();
  } else if (planetSequence == 4) {
    clearLegend();
    showOwnership();
  } else if (planetSequence == 5) {
    clearLegend();
    showInstallRate();
  }
}

function showPostcodes() {
  title = container
    .append("div")
      .classed("title", true)
      .text("postal areas")
      .style("opacity", 0);
  title.transition()
    .duration(2000)
    .style("opacity", 1);
  postcodes = globe
    .selectAll(".postcode")
      .data(postcodeData.features)
    .enter().append("path")
      .classed("postcode", true)
      .attr("d", path);
  postcodes.transition()
    .delay(function(d, i) { return 1000 / postcodeData.features.length * i; })
    .style("opacity", 1);
}

function showExposure() {
  title.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .duration(1000)
    .text("solar exposure")
    .style("opacity", 1);
  range = d3.extent(postcodeData.features.map(function(d) { return d.properties.solar; }));
  colourScale.domain([range[0], (range[0] + range[1]) / 2, range[1]]);
  postcodes.transition()
    .duration(1000)
    .style("fill", function(d) { return colourScale(d.properties.solar); });
  legendScale.domain(range);
  buildLegend();
  legendTitle.text("solar exposure (MJ/m²)")
  legendAxis.ticks(5, ".0f");
  drawLegend();
}

function showIncome() {
  title.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .duration(1000)
    .text("median household income")
    .style("opacity", 1);
  range = d3.extent(postcodeData.features.map(function(d) { return d.properties.income; }));
  colourScale.domain([range[0], (range[0] + range[1]) / 2, range[1]]);
  postcodes.transition()
    .duration(1000)
    .style("fill", function(d) { return colourScale(d.properties.income); });
  legendScale.domain(range);
  d3.timeout(function() {
    buildLegend();
    legendTitle.text("weekly income");
    legendAxis.ticks(5, "$,.0f");
    drawLegend();
  }, 1000);
}

function showOwnership() {
  title.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .duration(1000)
    .text("home ownership")
    .style("opacity", 1);
  range = d3.extent(postcodeData.features.map(function(d) { return d.properties.ownership; }));
  colourScale.domain([range[0], (range[0] + range[1]) / 2, range[1]]);
  postcodes.transition()
    .duration(1000)
    .style("fill", function(d) { return colourScale(d.properties.ownership); });
  legendScale.domain(range);
  d3.timeout(function() {
    buildLegend();
    legendTitle.text("owner-occupiers");
    legendAxis.ticks(5, ".0%");
    drawLegend();
  }, 1000);
}

function showInstallRate() {
  title.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .duration(1000)
    .text("solar installation rate")
    .style("opacity", 1);
  range = [0, 1];
  colourScale.domain([range[0], (range[0] + range[1]) / 2, range[1]]);
  postcodes.transition()
    .duration(1000)
    .style("fill", function(d) { return colourScale(d.properties.installRate); });
  legendScale.domain(range);
  d3.timeout(function() {
    buildLegend();
    legendTitle.text("installed");
    legendAxis.ticks(5, ".0%");
    drawLegend();
  }, 1000);
}
