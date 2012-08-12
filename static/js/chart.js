function plotOverTime (values) {
    var x = d3.time.scale().range([100, 700])
        .domain([d3.min(values, function(d){
            return d.time;
        }), d3.max(values, function(d){
            return d.time;
        })
        ]);
    var axis = d3.svg.axis().scale(x);
    var svg = d3.selectAll('svg')
    svg.selectAll("circle")
        .data(values)
    .enter().append("circle")
        .attr("cy", 90)
        .attr("cx", function(d) { return x(d.time); })
        .attr("r", function(d) { return Math.sqrt(d.interactions); })
        .attr("class", function(d) { return d.source; });
    svg.call(axis);
}

/*
function drawChartGrid (start, end) {
    // Takes start and end times (seconds since unix epoch)
    // Calculates range, draws appropriate grid
    // Adds labels to grid
    var division, lines, width, range = (end - start);
    if (range > 604800) {
        // range is more than a week
        // break it up into one day lines
        division = 86400;
        lines = Math.floor(range / 86400);
        // first line is 100px in
        width = $('#plot-canvas').width() - 100;

    }
    else if (range > 86400) {
        // range is more than a day
    }
    else if (range > 3600) {
        // range is more than an hour
    }
    else {
        // range is less than an hour
    }

}
*/

function chart_url(url) {
    $.getJSON("/url?url="+url,
        function(data) {
            var red = data['reddit_results'];
            var fb = data['facebook_results'];
            var results = [];
            var start = red[0]['timestamp']
            var end = red[(red.length - 1)]['timestamp']
            if (fb[0]['timestamp'] < start) {
                start = fb[0]['timestamp'];
            }
            if (fb[(fb.length - 1)]['timestamp'] > end) {
                end = fb[0]['timestamp'];
            }
            for (var i = 0; i < red.length; i++) {
                results.push({
                    time: (red[i]['timestamp']),
                    interactions: red[i]['score'],
                    source: 'reddit'
                })
            }
            for (var i = 0; i < fb.length; i++) {
                results.push({
                    time: (fb[i]['timestamp']),
                    interactions: 10,
                    source: 'facebook'
                })
            }
            plotOverTime(results, start, end);
        });
}

$(document).ready(function () {
    'use strict';
    $('#submit').click(
        function(e){
            e.preventDefault();
            chart_url($('#url').val());
            return false;
        });
});

