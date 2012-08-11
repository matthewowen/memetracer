function plotOverTime (data, color) {
    var svg = d3.selectAll('svg')
    svg.selectAll("circle")
        .data(data)
    .enter().append("circle")
        .attr("cy", 90)
        .attr("cx", function(d) { return String(d.time); })
        .attr("r", function(d) { return Math.sqrt(d.interactions); })
        .attr("fill", function() { return color; });
}

plotOverTime([
    {
        time: 100,
        interactions: 500
    },
    {
        time: 200,
        interactions: 300
    }
], 'blue');

plotOverTime([
    {
        time: 40,
        interactions: 60
    },
    {
        time: 400,
        interactions: 150
    }
], 'red');