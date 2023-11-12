const  margin = {top: 30, right: 30, bottom: 55, left: 70};
const w = 700 - margin.left - margin.right;
const h = 500 - margin.top - margin.bottom;

// Initialize svg, set width, height 
const svg = d3.select(".plot")
    .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// Function to get data
async function getData() {
    try {
        return fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
            .then(async (response) => await response.json())
    } catch(e) {
        return e;
    }
}

(async function(){
    // Get data, set titles
    let dataset = await getData();
    let title = "Doping in Professional Bicycle Racing";
    let yAxisTitle = "Minutes";
    datasetTime = dataset.map(d => d.Time);
    datasetYear = dataset.map(d => d.Year);
    const datasetCombined = dataset.map(data => {
        let d = new Date;
        d.setMinutes(data.Time.substring(0,2));
        d.setSeconds(data.Time.substring(3,5));
        return [data.Year,d,data.Name,data.Doping];
    });
    //console.log(dCombined[0])
    var timeFormat = d3.timeFormat('%M:%S');
    
    let barw = w / dataset.length;

    // datasetCombined = [];
    // for (let i = 0; i < datasetTime.length; i++) {
    //     let d = new Date;
    //     d.setMinutes(datasetTime[i].substring(0,2));
    //     d.setSeconds(datasetTime[i].substring(3,5));
    //     //console.log(d.toISOString().substring(14, 19))
    //     datasetCombined[i] = [datasetYear[i], d];
    // }
    //let d = new Date(null, null, null, null, datasetCombined[1][1].substring(0,2), datasetCombined[0][1].substring(3,5));
    //console.log(dataset);
    //console.log(datasetCombined);
    
    // Tooltip
    const tooltip = d3.select(".plot")
        .append("g")
            .attr("id", "tooltip")
            .attr("data-date", "")
            .attr("data-data", 0)
            .style("left", "0px")
            .style("visibility", "hidden");
    
    tooltip.append("div")
            .attr("class", "tooltip-text")
            .text("hidden");
    
    // Set color for data points based on data present
    const initializeColor = function(data) {
        if (data[3] != '') {
            return "aliceblue";
        } else {
            return "rgb(100,200,100)"
        }
    }

    // Function called when moving mouse out of bar 
    const mouseout = function(data) {
        d3.select(this).style("fill", initializeColor(data));
        tooltip.style("visibility", "hidden");
    } 

    // Function called when moving mouse into bar
    const mouseover = function() {
        d3.select(this).style("fill", "rgba(200,250,250,.7)");
        tooltip.style("visibility", "visible");
    }

    // Function called when mouse moves on bar
    // Sets tooltip text and changes location
    const mousemove = function(data) {
        tooltip.attr("data-year", data[0]);
        tooltip.attr("data-xvalue", data[1]);
        const text = d3.select('.tooltip-text');
        //text.html(`Year: ${tooltip.attr("data-year")}Time: ${tooltip.attr("data-xvalue").substring(19,24)}`);
        text.html(`Name: ${data[2]}<br/>Year: ${tooltip.attr("data-year")}, Time: ${tooltip.attr("data-xvalue").substring(19,24)}
        ${(data[3] != '' ? "<br/><br/>Allegation: " + data[3] : '')}`);
        const [x, y] = d3.mouse(this);
        tooltip.style("left", `${x+90}px`)
            .style("top", `${y-510}px`)
    };

    // Append title and y axis title
    svg.append('text')
        .attr("class", "text")
        .attr('transform', 'rotate(-90)')
        .attr('x', -250)
        .attr('y', -50)
        .style("font-size", "18px")
        .text(yAxisTitle);
        svg.append('text')
        .attr("class", "text")
        .attr('x', 300)
        .attr('y', 470)
        .style("font-size", "18px")
        .text("Year");
    svg.append('text')
        .attr("class", "text")
        .attr("id", "title")
        .style("font-size", "25px")
        .attr('x', 200)
        .attr('y', 30)
        .text(title);
    //console.log("hi")
    // Create x scale, append x axis
    const x = d3.scaleTime()
        .domain([d3.min(datasetCombined, (d) => new Date(d[0],0)), d3.max(datasetCombined, (d) => new Date(d[0],0))])
        .range([0, w])
    svg.append("g")
        .attr("transform", "translate(0," + h + ")")
        .attr("id", "x-axis")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("fill", "white");

    // Create y scale, append y axis
    const y = d3.scaleTime()
    .domain([d3.max(datasetCombined, d => d[1]), d3.min(datasetCombined, d => d[1])])
        .range([h, 0]);
        
    svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(y).tickFormat(timeFormat))
        .selectAll("text")
            .style("fill", "white");
    
    // Create bars, fill data points of chart
    svg.selectAll("circle")
        .data(datasetCombined)
        .enter()
        .append("circle")
            .attr("cx", d => x(new Date(d[0],0)))
            .attr("cy", d => y(d[1]))
            .attr("r", 5)
            .attr("data-year", d => d[0])
            .attr("data-xvalue", d => d[1])
            .attr("class", "bar")
            .attr("fill", initializeColor)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mousemove)

    // Create and append legend information
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(500,150)");
    
    legend.append("text")
        .text("Has allegations");

    legend.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("x", "85")
        .attr("y", "-13")
        .style("fill", "aliceblue");
    
    legend.append("text")
        .attr("y", "20")
        .text("No allegations");

    legend.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("x", "85")
        .attr("y", "8")
        .style("fill", "rgb(100,200,100");
            
})();