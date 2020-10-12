function prepChart() {
  margin = { top: 100, right: 150, bottom: 75, left: 100 };
  chart = container
    .append("svg")
      .attr("id", "chart")
      .on("click", clickChart);
  xAxisGroup = chart
    .append("g")
      .attr("id", "xAxisGroup")
      .classed("axisGroup", true)
      .attr("transform", "translate(0, " + (height - margin.bottom) + ")");
  xAxisLabel = xAxisGroup
    .append("text")
      .classed("axisLabel", true)
      .attr("x", width / 2)
      .attr("y", 48);
  yAxisGroup = chart
    .append("g")
      .attr("id", "yAxisGroup")
      .classed("axisGroup", true)
      .attr("transform", "translate(" + margin.left + ", 0)");
  yAxisLabel = yAxisGroup
    .append("text")
      .classed("axisLabel", true)
      .attr("y", margin.top - 32);
  chartGroup = chart
    .append("g")
      .attr("id", "chartGroup");
  x.range([margin.left, margin.left]);
  y.range([height - margin.bottom, height - margin.bottom]);
  xAxis = d3.axisBottom(x)
    .tickSizeOuter(0)
    .tickSizeInner(margin.top + margin.bottom - height)
    .tickPadding(10);
  yAxis = d3.axisLeft(y)
    .tickSizeOuter(0)
    .tickSizeInner(margin.left + margin.right - width)
    .tickPadding(10);
  chartClip = chartGroup
    .append("defs")
      .append("clipPath")
        .attr("id", "chartClip");
  chartClip.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 0)
    .attr("height", height);
  title = container
    .append("div")
      .classed("title", true);
}

function chartInstall() {
  chartSequence = 0;
  x = d3.scaleTime();
  y = d3.scaleLinear();
  prepChart();
  title.text("cumulative solar installations");
  yAxisLabel.text("installations");
  chartData = monthlyInstallData
    .filter(function(d) {
      return d.month > new Date("2005/07/01");
    });
  x.domain(d3.extent(chartData, function(d) { return d.month; }));
  xAxis.ticks(5);
  y.domain([0, d3.max(chartData, function(d) { return d.cumulative; })]).nice();
  yAxis.ticks(7);
  d3.timeout(drawChart, 1000);
  d3.timeout(function() {
    chartClip.select("rect")
      .transition()
        .duration(2000)
        .attr("width", width);
    area = d3.area()
      .x(function(d) { return x(d.month); })
      .y1(function(d) { return y(d.cumulative); })
      .y0(function() { return y(0); })
      .curve(d3.curveCardinal);
    plot = chartGroup
      .append("path")
        .classed("plot", true)
        .attr("d", area(chartData));
  }, 2000);
}

function chartInstallRate() {
  y.domain([0, d3.max(chartData, function(d) { return d.installations; })]).nice();
  area.y1(function(d) { return y(d.installations); })
  yAxisGroup.transition()
    .duration(2000)
    .call(yAxis);
  plot.transition()
    .duration(2000)
    .attr("d", area(chartData));
  title.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .text("monthly solar installations")
    .duration(1000)
    .style("opacity", 1);
}

function drawChart() {
  xAxisGroup.call(xAxis);
  x.range([margin.left, width - margin.right]);
  xAxisGroup.transition()
    .duration(2000)
    .call(xAxis)
    .style("opacity", 1);
  y.range([height - margin.bottom, margin.top]);
  yAxisGroup.transition()
    .duration(2000)
    .call(yAxis)
    .style("opacity", 1);
  d3.selectAll(".title, .axisLabel")
    .transition()
      .duration(2000)
      .style("opacity", 1);
}

function removeChart() {
  d3.selectAll("#chart, .title, .annotationText, .rSquared").transition()
    .duration(2000)
    .style("opacity", 0)
    .remove();
}

function clickChart() {
  chartSequence = chartSequence + 1;
  if (chartSequence == 1) {
    chartInstallRate();
  } else if (chartSequence == 2) {
    annotateInstallRate();
  } else if (chartSequence == 3) {
    removeChart();
    drawPlanet();
  } else if (chartSequence == 5) {
    scatterIncome();
  } else if (chartSequence == 6) {
    scatterOwnership();
  } else if (chartSequence == 7) {
    histogram();
  } else if (chartSequence == 8) {
    d3.timeout(final, 2000);
  }
}

function annotateInstallRate() {
  chartData.sort(function(a, b) {
    return d3.descending(a.installations, b.installations);
  });
  chartAnnotations = chart
    .selectAll(".chartAnnotation")
      .data(chartData.slice(0, 2))
    .enter().append("circle")
      .classed("chartAnnotation", true)
      .attr("r", 40)
      .attr("cx", function(d) { return x(d.month); })
      .attr("cy", function(d) { return y(d.installations); })
      .transition()
        .duration(1000)
        .style("opacity", .5);
  annotationText = container
    .append("div")
      .text("end of subsidy schemes")
      .classed("annotationText", true)
      .style("left", (centre[0] - 25) + "px")
      .style("top", y(69000) + "px");
  annotationText.transition()
    .duration(1000)
    .style("opacity", 1);
}

function chartScatter() {
  chartSequence = 4;
  x = d3.scaleLinear();
  y = d3.scaleLinear();
  prepChart();
  title.text("Is solar installed where the sun shines?");
  xAxisLabel.text("solar exposure (MJ/m²)");
  yAxisLabel.text("installations");
  chartData = postcodeData
    .features;
  x.domain(d3.extent(chartData, function(d) { return d.properties.solar; })).nice();
  xAxis.ticks(5);
  y.domain([0, 1]);
  yAxis.ticks(7, ".0%");
  d3.timeout(drawChart, 1000);
  d3.timeout(function() {
    chartClip.select("rect")
      .transition()
        .duration(2000)
        .attr("width", width)
        .on("end", function() {
          displayR(0.04419936099534594);
        });
    scatter = chartGroup
      .selectAll(".scatter")
        .data(postcodeData.features, function(d) { return d.properties.postcode; })
      .enter().append("circle")
        .classed("scatter", true)
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.properties.solar); })
        .attr("cy", function(d) { return y(d.properties.installRate); });
  }, 2000);
}

function displayR(x) {
  rSquared = container
    .append("div")
      .classed("rSquared", true)
      .style("top", margin.top + "px")
      .style("right", margin.right + "px")
      .text("R² = " + d3.format(".2f")(x));
  rSquared.transition()
    .duration(2000)
    .style("opacity", 1);
}

function scatterIncome() {
  rSquared.transition()
    .duration(1000)
    .style("opacity", 0)
    .remove();
  title.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .duration(1000)
    .text("Is solar installed in rich households?")
    .style("opacity", 1);
  xAxisLabel.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .text("median weekly household income")
    .duration(1000)
    .style("opacity", 1);
  x.domain(d3.extent(chartData, function(d) { return d.properties.income; })).nice();
  xAxis.ticks(5, "$,.0f");
  xAxisGroup.transition()
    .duration(2000)
    .call(xAxis);
  d3.timeout(function() {
    scatter = chartGroup
      .selectAll(".scatter")
        .data(postcodeData.features, function(d) { return d.properties.postcode; });
    scatter.exit()
      .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();
    scatter.transition()
      .duration(1000)
      .attr("cx", function(d) { return x(d.properties.income); })
      .attr("cy", function(d) { return y(d.properties.installRate); });
    scatter.enter()
      .append("circle")
        .classed("scatter", true)
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.properties.income); })
        .attr("cy", function(d) { return y(d.properties.installRate); });
    d3.timeout(function() {
      displayR(0.017828458260634172);
    }, 1000);
  }, 1000);
}

function scatterOwnership() {
  rSquared.transition()
    .duration(1000)
    .style("opacity", 0)
    .remove();
  title.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .duration(1000)
    .text("Is solar installed by owner-occupiers?")
    .style("opacity", 1);
  xAxisLabel.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .text("owner-occupiers")
    .duration(1000)
    .style("opacity", 1);
  x.domain(d3.extent(chartData, function(d) { return d.properties.ownership; })).nice();
  xAxis.ticks(5, ".0%");
  xAxisGroup.transition()
    .duration(2000)
    .call(xAxis);
  d3.timeout(function() {
    scatter = chartGroup
      .selectAll(".scatter")
        .data(postcodeData.features, function(d) { return d.properties.postcode; });
    scatter.exit()
      .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();
    scatter.transition()
      .duration(1000)
      .attr("cx", function(d) { return x(d.properties.ownership); })
      .attr("cy", function(d) { return y(d.properties.installRate); });
    scatter.enter()
      .append("circle")
        .classed("scatter", true)
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.properties.ownership); })
        .attr("cy", function(d) { return y(d.properties.installRate); });
    d3.timeout(function() {
      displayR(0.07448449463227347);
    }, 1000);
  }, 1000);
}

function histogram() {
  d3.selectAll(".rSquared, .scatter").transition()
    .duration(1000)
    .style("opacity", 0)
    .remove();
  title.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .duration(1000)
    .text("distribution of rooftop solar (postcodes)")
    .style("opacity", 1);
  chartData = postcodeData
    .features
    .map(function(d) {
      return d.properties.installRate;
    });
  bins = d3.histogram()
    .thresholds(40)
    (chartData);
  binScale = d3.scaleBand()
    .domain(bins.map(function(d) { return d.x0; }))
    .range([margin.left, width - margin.right])
    .padding(.05);
  y.domain(d3.extent(bins, function(d) { return d.length; }));
  xAxisLabel.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .text("installations")
    .duration(1000)
    .style("opacity", 1);
  yAxisLabel.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .text("frequency")
    .duration(1000)
    .style("opacity", 1)
  x.domain([0, 1]);
  xAxis.ticks(5, ".0%")
    .tickSizeInner(0);
  xAxisGroup.transition()
    .duration(2000)
    .call(xAxis);
  yAxis.ticks(7, ".0f");
  yAxisGroup.transition()
    .duration(2000)
    .call(yAxis);
  d3.timeout(function() {
    bars = chartGroup
      .selectAll(".bar")
        .data(bins)
      .enter().append("rect")
        .classed("bar", true)
        .attr("x", function(d) { return binScale(d.x0); })
        .attr("y", y(0))
        .attr("width", binScale.bandwidth())
        .attr("height", 0);
    bars.transition()
      .duration(2000)
      .attr("y", function(d) { return y(d.length); })
      .attr("height", function(d) { return y(0) - y(d.length); });
  }, 2000);
}

function final() {
  recommendation = 0;
  title.transition()
    .duration(1000)
    .style("opacity", 0)
  .transition()
    .text("recommendations")
    .duration(1000)
    .style("opacity", 1);
  chart.transition()
    .duration(2000)
    .style("opacity", .25);
  recommendations = container
    .append("div")
      .classed("recommendations", true)
      .on("click", listRecommendations);
  recommendations.transition()
    .duration(2000)
    .delay(1000)
    .style("opacity", 1);
  recommendations.append("ul");
  recommendations.select("ul")
    .append("li")
      .html("<span>survey — </span> gather more detailed data to improve analysis");
  recommendations.select("ul")
    .append("li")
      .html("<span>census 2021 — </span> more accurate data available in 18 months");
  recommendations.select("ul")
    .append("li")
      .html("<span>new analysis —</span> focus on when installation rates increase");
}

function listRecommendations() {
  recommendation = recommendation + 1;
  d3.select("li:nth-child(" + recommendation + ")")
    .transition()
      .style("opacity", 1);
}
