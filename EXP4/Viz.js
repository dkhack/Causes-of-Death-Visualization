internationalNumberFormat = new Intl.NumberFormat('en-US')

//Map Properties
var margin = {top : 50, left:50, right: 50, bottom : 50},
    height = 600 - margin.top - margin.bottom,
    width = 1200 - margin.left - margin.right;

var lowColor = '#EFEFEF'
var highColor = '#E71212'

// Map Projection
var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]) // translate to center of screen
  .scale([1000]); // scale things down so see entire US

var path = d3.geoPath() 
  .projection(projection); 


// Slider
document.getElementById('year').addEventListener('change', function() {

	var curr_year = this.value;

	console.log("curr_year ", curr_year);

	d3.select('#map').selectAll('svg').remove();

	update(false,curr_year);
});

// file info
var file = "DeathCause.csv"
var causeOfDeath = "All causes"
var file_feature = 'deaths'

// Load death data
update(true,2015);
function update(start,year) {
	var map = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

	// file info

	var file = "DeathCause.csv"
	var causeOfDeath = "All causes"
	
	// Load death data
	d3.csv(file, function(data) {
		var dataArray = [];

		var simpleDeathData = data.filter(function(entry) {
			if(entry.year == year & entry.cause == causeOfDeath & entry.state != "United States"){
				return entry;
			}
			else{return false}
		})

		for (var i = 0; i < simpleDeathData.length; i++) {
			dataArray.push(parseFloat(simpleDeathData[i].deaths))		
		}
		var colordata = simpleDeathData

		console.log(dataArray)

		var minVal = 0
		var maxVal = 280000
		
		var colordata = simpleDeathData

		//var minVal = d3.min(dataArray)
		console.log(minVal, maxVal)
		var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
		
	// Load GeoJSON and merge with desired data
	d3.json("us-states.json", function(json) {

		for (var i = 0; i < colordata.length; i++) {
			// Note to self: Make deaths modifiable
			var dataState = colordata[i].state;
			var dataValue = colordata[i].deaths;

			// Find the corresponding state inside the GeoJSON
			for (var j = 0; j < json.features.length; j++) {
			var jsonState = json.features[j].properties.name;

			if (dataState == jsonState) {
				if(file == 'DeathCause.csv') {
					json.features[j].properties.deaths = dataValue;
				}
				else if(file == 'Income.csv') {
					json.features[j].properties.GDP = dataValue;
				}
				break;
			}
			}
		}

		map.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#4E4E4E")
			.style("stroke-width", "1")
			.style("fill", function(d) { return ramp(d.properties.deaths) })
			.on("mouseover", handleMouseOver)
			.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
			.on("mouseout", handleMouseOut);
			;
			function handleMouseOver(d) {
				tooltip.text(internationalNumberFormat.format(d.properties.deaths));
				color = ramp(d.properties.deaths)
				d3.select(this).style("stroke-width", "4")
					.style("fill", d3.rgb(color).darker(0.5))
				return tooltip.style("visibility", "visible")
			}
			function handleMouseOut() {
				d3.select(this).style("stroke-width", "1")
				d3.select(this).style("fill", d3.rgb(color).brighter(0.5))
				return tooltip.style("visibility", "hidden");
			}

			var tooltip = d3.select("body")
				.append("div")
				.style("position", "absolute")
				.style("z-index", "10")
				.style("visibility", "hidden")
				.style("background", "#fff")
				.text("Should not be seeing this");

			// Legend
			if(start == true) {
				var w = 140, h = 300;

				var key = d3.select("body")
					.append("svg")
					.attr("id", "key")
					.attr("width", w)
					.attr("height", h)
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
					.attr("stop-color", highColor)
					.attr("stop-opacity", 1);
					
				legend.append("stop")
					.attr("offset", "100%")
					.attr("stop-color", lowColor)
					.attr("stop-opacity", 1);

				key.append("rect")
					.attr("width", w - 100)
					.attr("height", h)
					.style("fill", "url(#gradient)")
					.attr("transform", "translate(0,10)");

				var y = d3.scaleLinear()
					.range([h, 0])
					.domain([minVal, maxVal]);

				var yAxis = d3.axisRight(y);

				key.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(41,10)")
					.call(yAxis)
			}
		});
	});
}