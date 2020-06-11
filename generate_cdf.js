//Global variable declaration
const t = 500; //duration for transitions
var prob_interval = .03; //margin of error for filtering common probability events
var tbl_pcts = [0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999]; //values to be shown in table output

//I'm pretty sure this global variable is bad practice but I haven't figured out how to refactor it better yet
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


//set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 55},
    width = 480 - margin.left - margin.right,
    height = 360 - margin.top - margin.bottom;

//append the svg object to the body of the page
var svg = d3.select("#cdf_graph")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//initialize X axis
var x = d3.scaleLinear().range([0,width]);
var xAxis = d3.axisBottom().scale(x);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .attr("class","myXaxis");

//text label for X axis
svg.append("text")             
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                         (height + margin.top + 22) + ")")
    .style("text-anchor", "middle")
    .text("Number of Kills");

//initialize Y axis
var y = d3.scaleLinear().range([height, 0]);
var yAxis = d3.axisLeft().scale(y)
	.tickFormat(d3.format(",.0%"));
svg.append("g")
  .attr("class","myYaxis");

//text label for Y axis
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 3 - margin.left)
  .attr("x",0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Probability of going dry"); 

//function to update graph and numbers on page
//will run when droprate or killcount is changed
function update() {

	//update dataset for graph
	droprate = document.getElementById("droprate").value;
	killcount = document.getElementById("killcount").value;
	var cdf_data = [];
	for (var i = 1; i < (droprate*5); i++) {
	  kill = i;
	  prob = (1 - (1/droprate))**i;
	  cdf_data.push({kills: kill, probs: prob});
	}

	//create X axis
	x.domain([0, d3.max(cdf_data, function(d) { return d.kills }) ]);
	svg.selectAll(".myXaxis")
		.transition()
	  .duration(t)
	  .call(xAxis);

	//create Y axis
	y.domain([0, 1]);
	svg.selectAll(".myYaxis")
	  .transition()
	  .duration(t)
	  .call(yAxis);

	//update data for line
	var myline = svg.selectAll(".cdfLine")
	  .data([cdf_data], function(d){ return d });

	//update line
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

	//update data for killcount dot
	var kcData = cdf_data.filter(cdf_data => cdf_data.kills == killcount);
	if(kcData.length < 1) {
		kcData = cdf_data.slice(cdf_data.length - 1);
	}
	var kcDot = svg.selectAll(".kcDot")
	  .data(kcData);

	//update killcount dot
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

	//make sure dot is drawn in front of the line
	kcDot.raise();

	//update table
	var kcTable = document.getElementById('kcTable');
	for (var i = 0; i < tbl_pcts.length; i++) {
		tbl_pct = (tbl_pcts[i]*100).toFixed(1)+"%"
		tbl_kc = Math.floor(Math.log(1-tbl_pcts[i]) / Math.log(1-(1/droprate)));
		kcTable.rows[0].cells[i].innerHTML=tbl_pct;
		kcTable.rows[1].cells[i].innerHTML=tbl_kc;
	}

	//update text below graph
	document.getElementById('kc_span').textContent = killcount;

	var kcProb = (1 - (1/droprate))**killcount;
	document.getElementById('kcprob_span').textContent = (kcProb*100).toFixed(2);

	//for low-probability events, reduce interval for probability comparisons
	prob_interval = .03
	if(kcProb < .01) {
		prob_interval = .002
	} else if(kcProb < .05) {
		prob_interval = .01
	}

	//select random event that has a similar probability to kcProb
	var prob_events = event_data.filter(event_data => 
		event_data.prob < (kcProb + prob_interval) && event_data.prob > (kcProb - prob_interval));
	if (prob_events.length > 0) {
		var rand_event = prob_events[Math.floor(Math.random() * prob_events.length)].event;
	} else {
		var rand_event = "...oops I don't know! Send me suggestions!";
	}
	document.getElementById("prob_event_span").textContent = rand_event

}

