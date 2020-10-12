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
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", 0)
    .attr("height", height - margin.top - margin.bottom);
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
        .attr("width", width - margin.left - margin.right);
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
  d3.selectAll("#chart, .title, .annotationText").transition()
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
  } else if (chartSequence ==3) {
    removeChart();
    drawPlanet();
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
