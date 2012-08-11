function plotOverTime (values) {
    var svg = d3.selectAll('svg')
    svg.selectAll("circle")
        .data(values)
    .enter().append("circle")
        .attr("cy", 90)
        .attr("cx", function(d) { return String(d.time); })
        .attr("r", function(d) { return Math.sqrt(d.interactions); })
        .attr("class", function(d) { return d.source; });
}

function chart_url(url) {
    $.getJSON("/url?url="+url,
        function(data) {
            var red = data['reddit_results'];
            var fb = data['reddit_results'];
            var results = [];
            var start = red[0]['timestamp']
            if (fb[0]['timestamp'] < start) {
                start = fb[0]['timestamp'];
            }
            for (var i = 0; i < red.length; i++) {
                results.push({
                    time: ((red[i]['timestamp'] - start)/50 + 100),
                    interactions: red[i]['score']/10,
                    source: 'reddit'
                })
            }
            for (var i = 0; i < fb.length; i++) {
                results.push({
                    time: ((fb[i]['timestamp'] - start)/100 + 100),
                    interactions: 10,
                    source: 'facebook'
                })
            }
            plotOverTime(results);
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

