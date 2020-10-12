function intro() {
  logoSequence = 0;
  setUpLogo();
}

function setUpLogo() {
  logo = container
    .append("svg")
      .attr("id", "logo")
      .style("width", width + "px")
      .style("height", height + "px")
      .on("click", clickLogo);
  logoGroup = logo
    .append("g")
      .attr("id", "logoGroup")
        .attr("transform", "translate(" + centre[0] + ", " + centre[1] + ")");
  logoClipTop = logoGroup
    .append("defs")
      .append("clipPath")
        .attr("id", "logoClipTop");
  logoClipBottom = logoGroup
    .append("defs")
      .append("clipPath")
        .attr("id", "logoClipBottom");
  logoClipTop.append("rect")
    .attr("width", width)
    .attr("height", height / 2)
    .attr("x", -width / 2)
    .attr("y", -height / 2);
  logoClipBottom.append("rect")
    .attr("width", width)
    .attr("height", height / 2)
    .attr("x", -width / 2);
}

function clickLogo() {
  logoSequence = logoSequence + 1;
  if (logoSequence == 1) {
    sunrise();
  } else if (logoSequence == 2) {
    logoComplete();
  };
}

function sunrise() {
  logo.transition()
    .duration(4000)
    .style("background-color", "#EF4124")
  .transition()
    .duration(2000)
    .style("background-color", "white");
  logoCircle = logoGroup
    .append("circle")
      .attr("cx", -640)
      .attr("cy", 360)
      .attr("r", 1);
  logoCircle.transition()
    .duration(4000)
    .attr("r", 20)
    .attrTween("cx", function() {
        return function(t) {
          return -640 * Math.cos(t * Math.PI / 2);
        };
      })
      .attrTween("cy", function() {
        return function(t) {
          return 360 * Math.cos(t * Math.PI / 2);
        };
      })
    .on("end", logoForm);
}

function logoForm() {
  logoSolar = logoGroup
    .append("text")
      .attr("id", "logoSolar")
      .text("SOLAR")
      .attr("y", 99);
  logoDivide = logoGroup
    .append("text")
      .attr("id", "logoDivide")
      .text("DIVIDE")
      .attr("y", -98);
  logoCircle.style("stroke-width", 0)
    .transition()
    .duration(2000)
    .style("stroke-width", 4)
    .attr("r", 150);
  logoGroup.selectAll("text")
    .transition()
      .duration(2000)
      .delay(500)
      .attr("y", 0);
}

function logoComplete() {
  logoGroup.transition()
    .duration(2000)
    .attr("transform", "translate(1225, 55)");
  logoCircle.transition()
    .duration(2000)
    .attr("r", 40)
    .style("stroke-width", 1.5);
  logoGroup.selectAll("text")
    .style("font-size", "5rem")
    .transition()
      .duration(2000)
      .style("font-size", "1.25rem");
  chartInstall();
}
