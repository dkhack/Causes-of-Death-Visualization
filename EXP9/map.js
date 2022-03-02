internationalNumberFormat = new Intl.NumberFormat('en-US')

//Map Properties
var mapmargin = {top : 50, left:50, right: 50, bottom : 25},
    mapheight = 600 - mapmargin.top - mapmargin.bottom,
    mapwidth = 1200 - mapmargin.left - mapmargin.right;

// Map Projection
var projection = d3.geoAlbersUsa()
  .translate([mapwidth / 2, mapheight / 2]) // translate to center of screen
  .scale([1000]); // scale things down so see entire US

var path = d3.geoPath() 
  .projection(projection); 

var map = d3.select("#map")
  .append("svg")
  .attr("transform",
	  "translate(" + 10 + "," + 70 + ")")
  .attr("width", mapwidth)
  .attr("height", mapheight)
  .style("background", "rgb(124, 229, 255)")
  .style("border-radius","4em");

// Legend Base
var w = 140, h = 400;

var key = d3.select("body")
	.append("svg")
	.attr("id", "key")
	.attr("transform",
		"translate(" + 0 + "," + 70 + ")")
	.attr("width", w)
	.attr("height", h)
	.style("border-radius", "0em")
	.style("background", "rgb(124, 229, 255)")
	.attr("class", "legend");

var legend = key.append("defs")
	.append("svg:linearGradient")
	.attr("id", "gradient")
	.attr("x1", "100%")
	.attr("y1", "0%")
	.attr("x2", "100%")
	.attr("y2", "100%")
	.attr("spreadMethod", "pad");

legend.append("stop")
	.attr("offset", "0%")
	.attr("stop-color", "#E71212")
	.attr("stop-opacity", 1);
	
legend.append("stop")
	.attr("offset", "100%")
	.attr("stop-color", "#EFEFEF")
	.attr("stop-opacity", 1);

key.append("rect")
	.attr("width", w - 100)
	.attr("height", h)
	.style("fill", "url(#gradient)")
	.attr("transform", "translate(0,10)");

var y = d3.scaleLinear()
	.range([h, 10])
	.domain([0, 1]);

var yAxis = d3.axisRight(y);

key.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(41,10)")
	.call(yAxis)

// file info
var file = "DeathCause.csv"
var measure = "All causes"
var curr_year = 2015

function DropDownClick(dataset, input) {
	if(input=="Alzheimers disease"){
		input = "Alzheimer's disease"
	}
	measure = input
	file = dataset
	updateMap(false,curr_year,measure)
}

// Slider
document.getElementById('year').addEventListener('change', function() {
	curr_year = this.value;
	//console.log("curr_year ", curr_year);
	updateMap(false,curr_year,measure);
});

// Update Function
drawGraph(file, "United States", measure, '#E71212', true)
updateMap(true,2015,measure);
function updateMap(start,year,measure) {
	// Load data
	d3.csv(file, function(data) {
		var dataArray = [];
		var simpleData = data.filter(function(entry) {
			if(entry.year == year & entry.measure == measure & entry.state != 'United States'){
				return entry;
			}
			else{return false}
		})
	
		for (var i = 0; i < simpleData.length; i++) {
			dataArray.push(parseFloat(simpleData[i].value))		
		}
		//console.log(simpleData)
		//console.log(dataArray)
		
		var minVal = d3.min(dataArray)
		var maxVal = d3.max(dataArray)
		//console.log(minVal, maxVal)

		var lowColor = "#EFEFEF"
		if(file === 'DeathCause.csv'){
			var highColor = '#E71212'
		}
		else if(file === 'Income.csv'){
			var highColor ='#258f41'
		}
		var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
		if(start==true){
			var tooltip = d3.select("body")
				.append("div").attr("id","tooltip")
				.style("position", "absolute")
				.style("z-index", "10")
				.style("visibility", "hidden")
				.style("background", "#fff")
				.style("background-color", "white")
				.style("border", "solid")
				.style("border-width", "2px")
				.style("border-radius", "5px")
				.style("padding", "5px")
				.text("Should not be seeing this");
		}
		else{
			var tooltip = d3.select("#tooltip")
				.style("position", "absolute")
				.style("z-index", "10")
				.style("visibility", "hidden")
				.style("background", "#fff")
				.style("background-color", "white")
				.style("border", "solid")
				.style("border-width", "2px")
				.style("border-radius", "5px")
				.style("padding", "5px")
				.text("Should not be seeing this");
		}

		// Load GeoJSON and merge with desired data
		d3.json("us-states.json", function(json) {

			for (var i = 0; i < simpleData.length; i++) {
				var dataState = simpleData[i].state;
				var dataValue = simpleData[i].value;

				// Find the corresponding state inside the GeoJSON
				for (var j = 0; j < json.features.length; j++) {
					var jsonState = json.features[j].properties.name;

					if (dataState == jsonState) {
						json.features[j].properties.value = dataValue;
						break;
					}
				}
			}
			if(start==true){
				map.selectAll("path")
					.data(json.features)
					.enter()
					.append("path")
					.attr("id","ColorPath")
					.attr("d", path)
					.style("stroke", "#4E4E4E")
					.style("stroke-width", "1")
					.style("fill", function(d) { return ramp(d.properties.value) })
					.on("mouseover", handleMouseOver)
					.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
					.on("mouseout", handleMouseOut)
					.on("click", handleClick);
			}
			else{
				map.selectAll("path").select("#ColorPath")
					.data(json.features)
					.enter()
					.append("path")
					.attr("id","ColorPath")
					.attr("d", path)
					.style("stroke", "#4E4E4E")
					.style("stroke-width", "1")
					.style("fill", function(d) { return ramp(d.properties.value) })
					.on("mouseover", handleMouseOver)
					.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
					.on("mouseout", handleMouseOut)
					.on("click", handleClick);
			}
				function handleClick(d) {
					drawGraph(file, d.properties.name, measure, highColor, false)
				}
				function handleMouseOver(d) {
					tooltip.text(d.properties.name + ": " + internationalNumberFormat.format(d.properties.value));
					color = ramp(d.properties.value)
					d3.select(this).style("stroke-width", "4")
						.style("fill", d3.rgb(color).darker(0.5))
					return tooltip.style("visibility", "visible").style("stroke", "black")
				}
				function handleMouseOut() {
					d3.select(this).style("stroke-width", "1")
					d3.select(this).style("fill", d3.rgb(color))
					return tooltip.style("visibility", "hidden");
				}
	
		});
		
		legend.select("stop").transition().attr("stop-color",highColor)
		Mapy = d3.scaleLinear()
			.range([h, 0])
			.domain([minVal, maxVal])
		MapyAxis = d3.axisRight(Mapy)
		key.select("g").transition().call(MapyAxis)
	});
}

// Linegraph
var graphmargin = {top: 60, right: 30, bottom: 70, left: 100},
			graphwidth = 700 - graphmargin.left - graphmargin.right,
			graphheight = 700 - graphmargin.top - graphmargin.bottom;

var svg = d3.select("#linegraph")
	.append("svg")
	.attr("transform",
		"translate(" + 1175 + "," + -600 + ")")
	.attr("width", graphwidth + graphmargin.left + graphmargin.right)
	.attr("height", graphheight + graphmargin.top + graphmargin.bottom)
	.style("background","#EFEFEF")
	.style("border-radius","4em")
	.append("g")
	.attr("transform",
		"translate(" + graphmargin.left + "," + graphmargin.top + ")");

var x = d3.scaleLinear().range([0,graphwidth]);
var xAxis = d3.axisBottom().scale(x).tickFormat(d3.format("d"));
svg.append("g")
	.attr("transform", "translate(0," + graphheight + ")")
	.attr("class","myXaxis")

	var y = d3.scaleLinear().range([graphheight, 0]);
	var yAxis = d3.axisLeft().scale(y);
	svg.append("g")
		.attr("class","myYaxis")

function drawGraph(file, state, measure, color,start) {
	function sortByKey(array, key) {
		return array.sort(function(a, b) {
			var x = a[key]; var y = b[key];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	}

	d3.csv(file, function(data){
		var graphData = data.filter(function(entry) {
			if(entry.measure == measure & entry.state == state & entry.year >= 2005 & entry.year <= 2015){
				return entry;
			}
		})
		var minVal = parseFloat(graphData[0].value)
		var maxVal = parseFloat(graphData[0].value)
		graphData = sortByKey(graphData, "year")
		for (var i = 0; i < graphData.length; i++) {
			if(minVal > parseFloat(graphData[i].value)){
				minVal = parseFloat(graphData[i].value)
			}
			if(maxVal < parseFloat(graphData[i].value)){
				maxVal = parseFloat(graphData[i].value)
			}
		}

	updateGraph(graphData, minVal, maxVal, color, start)
	function updateGraph(data, minVal, maxVal, color, start) {

		// X axis:
		x.domain([2005, 2015]);
		svg.selectAll(".myXaxis").transition()
			.duration(2000)
			.call(xAxis);

		// Y axis
		y.domain([minVal, maxVal]);
		svg.selectAll(".myYaxis")
			.transition()
			.duration(2000)
			.ease(d3.easeExp,8)
			.call(yAxis);

		if(start==true){
			// Title
			svg.append('text').attr("id",'titletext')
			.attr('x', graphwidth/2)
			.attr('y', -30)
			.attr('text-anchor', 'middle')
			.style('font-size', 25)
			.text(state + ": ")
			svg.append('text').attr("id",'subtitletext')
			.attr('x', graphwidth/2)
			.attr('y', -10)
			.attr('text-anchor', 'middle')
			.style('font-size', 18)
			.text(measure);
			
			// X label
			svg.append('text')
			.attr('x', graphwidth/2)
			.attr('y', graphheight + 50)
			.attr('text-anchor', 'middle')
			.style('font-size', 20)
			.text('Year');
			
			// Y label
			svg.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(-60,' + graphheight/2 + ')rotate(-90)')
			.style('font-size', 20)
			.text("Deaths");
		}
		else{
			svg.select('#titletext')
				.transition()
				.text(state + ": ")
			svg.select('#subtitletext')
				.transition()
				.text(measure)
		}

		// Update the line
		var u = svg.selectAll(".lineTest")
			.data([data], function(d){ return d.year });

		u
			.enter()
			.append("path")
			.attr("class","lineTest")
			.merge(u)
			.transition()
			.duration(3000)
			.attr("d", d3.line()
			.x(function(d) { return x(d.year); })
			.y(function(d) { return y(d.value); }))
			.attr("fill", "none")
			.attr("stroke", color)
			.attr("stroke-width", 2.5)
		}
	})
}
