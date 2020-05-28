
var t = 750; //duration for transitions


// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 50},
    width = 480 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#cdf_graph")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Initialise a X axis:
var x = d3.scaleLinear().range([0,width]);
var xAxis = d3.axisBottom().scale(x);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .attr("class","myXaxis")

// Initialize an Y axis
var y = d3.scaleLinear().range([height, 0]);
var yAxis = d3.axisLeft().scale(y);
svg.append("g")
  .attr("class","myYaxis")

//generate initial graph upon startup
update();

// Create a function that updates the plot:
function update() {
  
  //update dataset
  droprate = document.getElementById("droprate").value;
  killcount = document.getElementById("killcount").value;
  var cdf_data = [];
  for (var i = 1; i < (droprate*5); i++) {
    kill = i;
    prob = (1 - (1/droprate))**i.toFixed(5);
    cdf_data.push({kills: kill, probs: prob});
  }

  // Create the X axis:
  x.domain([0, d3.max(cdf_data, function(d) { return d.kills }) ]);
  svg.selectAll(".myXaxis").transition()
    .duration(t)
    .call(xAxis);

  // create the Y axis
  y.domain([0, 1]);
  svg.selectAll(".myYaxis")
    .transition()
    .duration(t)
    .call(yAxis);

  // Create a update selection: bind to the new data
  var myline = svg.selectAll(".cdfLine")
    .data([cdf_data], function(d){ return d });

  // Updata the line
  myline
    .enter()
    .append("path")
    .attr("class","cdfLine")
    .merge(myline)
    .transition()
    .duration(t)
    .attr("d", d3.line()
      .x(function(d) { return x(d.kills); })
      .y(function(d) { return y(d.probs); }))

  //Append killcount dot to svg
  var kcData = cdf_data.filter(cdf_data => cdf_data.kills == killcount)
  var kcDot = svg.selectAll(".kcDot")
    .data(kcData)
  
  kcDot
    .enter()
    .append("circle")
    .attr("class", "kcDot")
    .merge(kcDot)
    .transition()
    .duration(t)
    .attr("cx", function(d) {return x(d.kills) })
    .attr("cy", function(d) {return y(d.probs) })
    .attr("r", 5)
}



