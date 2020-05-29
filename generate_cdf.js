
const t = 500; //duration for transitions

//I'm pretty sure this is bad practice but I'm so confused at this point how to make it work
var event_data = [];
d3.csv("events.csv", function(data) {
	data.forEach(function(d) {
		myEvent = d.event
		myProb = +d.prob
		event_data.push({event: myEvent, prob: myProb});
	})

	//generate initial view
	update();
});


// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 55},
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
  .attr("class","myXaxis");

//Text label for X axis
svg.append("text")             
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                         (height + margin.top + 22) + ")")
    .style("text-anchor", "middle")
    .text("Number of Kills");

// Initialize an Y axis
var y = d3.scaleLinear().range([height, 0]);
var yAxis = d3.axisLeft().scale(y)
	.tickFormat(d3.format(",.0%"));
svg.append("g")
  .attr("class","myYaxis");

//Text label for Y axis
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 3 - margin.left)
  .attr("x",0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Probability of going dry"); 


//function that updates the plot
function update() {

	//update dataset
	droprate = document.getElementById("droprate").value;
	killcount = document.getElementById("killcount").value;
	var cdf_data = [];
	for (var i = 1; i < (droprate*5); i++) {
	  kill = i;
	  prob = (1 - (1/droprate))**i;
	  cdf_data.push({kills: kill, probs: prob});
	}

	// Create the X axis:
	x.domain([0, d3.max(cdf_data, function(d) { return d.kills }) ]);
	svg.selectAll(".myXaxis")
		.transition()
	  .duration(t)
	  .call(xAxis);

	// create the Y axis
	y.domain([0, 1]);
	svg.selectAll(".myYaxis")
	  .transition()
	  .duration(t)
	  .call(yAxis);

	// update data for the line
	var myline = svg.selectAll(".cdfLine")
	  .data([cdf_data], function(d){ return d });

	// Update the line
	myline
	  .enter()
	  .append("path")
	  .attr("class","cdfLine")
	  .merge(myline)
	  .transition()
	  .duration(t)
	  .attr("d", d3.line()
	    .x(function(d) { return x(d.kills); })
	    .y(function(d) { return y(d.probs); }));
	 myline.exit().remove();

	//Update data for killcount dot
	var kcData = cdf_data.filter(cdf_data => cdf_data.kills == killcount);
	if(kcData.length < 1) {
		kcData = cdf_data.slice(cdf_data.length - 1);
	}
	var kcDot = svg.selectAll(".kcDot")
	  .data(kcData);

	//Update the killcount dot
	 kcDot
	  .enter()
	  .append("circle")
	  .attr("class", "kcDot")
	  .merge(kcDot)
	  .attr("r", 5)
	  .transition()
	  .duration(t)
	  .attr("cx", function(d) {return x(d.kills) })
	  .attr("cy", function(d) {return y(d.probs) })

	//Make sure dot is drawn in front of the line
	kcDot.raise();

	//update text below graph
	var kc_span = document.getElementById('kc_span')
		.textContent = killcount;

	var kcProb = (1 - (1/droprate))**killcount;
	var kcprob_span = document.getElementById('kcprob_span')
		.textContent = (kcProb*100).toFixed(2);

	var prob_events = event_data.filter(event_data => event_data.prob < (kcProb + .02) && event_data.prob > (kcProb - .02));
	if (prob_events.length > 0) {
		var rand_event = prob_events[Math.floor(Math.random() * prob_events.length)].event;
	} else {
		var rand_event = "oops I got nothin";
	}
	var prob_event_span = document.getElementById("prob_event_span")
		.textContent = rand_event
}


