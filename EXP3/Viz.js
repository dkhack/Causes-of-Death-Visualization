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

var map = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// file info
var file = "def.csv"
var year = String(2017)
var causeOfDeath = "All causes"
var file_feature = 'deaths'

// Load death data
d3.csv(file, function(data) {
	var dataArray = [];
	if(file === "DeathCause.csv"){
		for (var i = 0; i < data.length; i++) {
			if(data[i].year === year & data[i].cause === causeOfDeath) {
				console.log(data[i].year, data[i].cause, data[i].deaths, data[i].state)
				dataArray.push(parseFloat(data[i].deaths))
			}
	}
	}
	else{
		for (var i = 0; i < data.length; i++) {
			dataArray.push(parseFloat(data[i].deaths))
		}
	}

	var minVal = d3.min(dataArray)
	var maxVal = d3.max(dataArray)
	var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
	
  // Load GeoJSON and merge with desired data
d3.json("us-states.json", function(json) {

    for (var i = 0; i < data.length; i++) {
        // Note to self: Make deaths modifiable
        var dataState = data[i].state;
        var dataValue = data[i].deaths;

        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++) {
        var jsonState = json.features[j].properties.name;

        if (dataState == jsonState) {
            json.features[j].properties.deaths = dataValue;
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
			tooltip.text(d.properties.deaths);
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
		var w = 140, h = 300;

		var key = d3.select("body")
			.append("svg")
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
  });
});