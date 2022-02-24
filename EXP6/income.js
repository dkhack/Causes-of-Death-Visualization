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

// file info
var file = "Income.csv"
var causeOfDeath = "All causes"
var curr_year = 2015


// DropDown
d3.csv(file, function(data) {
	var causes = ['All causes', 'Unintentional injuries', "Alzheimer's disease", 'Stroke', 
		'CLRD', 'Diabetes', 'Heart disease', 'Influenza and pneumonia', 'Suicide', 
		'Cancer', 'Kidney disease']

	var select = d3.select('body')
		.append('select')
		.attr('class','select')
		.on('change',onchange)

	var options = select
		.selectAll('option')
		.data(causes).enter()
		.append('option')
		.text(function (d) { return d; });

	function onchange() {
		causeOfDeath = d3.select('select').property('value')
		d3.select(key).remove();
		d3.select('#map').selectAll('svg').remove();
		update(true,curr_year,causeOfDeath)
	};
})

// Slider
document.getElementById('year').addEventListener('change', function() {

	curr_year = this.value;
	console.log("curr_year ", curr_year);
	d3.select('#map').selectAll('svg').remove();
	d3.select(key).remove();
	update(true,curr_year,causeOfDeath);
});

// Load death data
update(true,2015);
function update(update_legend,year) {
	var map = d3.select("#map")
		.append("svg")
		.attr("width", width)
		.attr("height", height);
	
	// Load death data
	d3.csv(file, function(data) {
		var dataArray = [];

		var simpleDeathData = data.filter(function(entry) {
			console.log(entry)
			if(entry.year == year & entry & entry.state != "United States"){
				console.log(entry)
				return entry;
			}
			else{return false}
		})

		for (var i = 0; i < simpleDeathData.length; i++) {
			console.log(simpleDeathData[i].gdp)
			dataArray.push(parseFloat(simpleDeathData[i].GDP))		
		}
		var colordata = simpleDeathData

		console.log(dataArray)
		if(update_legend === true){
			var minVal = d3.min(dataArray)
			var maxVal = d3.max(dataArray)
		}
		
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
				d3.select(this).style("fill", d3.rgb(color))
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
			if(update_legend == true) {
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