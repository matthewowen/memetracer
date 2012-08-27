function memechart (initial) {
    'use strict'
    var mc = {
        plotOverTime: function (values) {
            var x = d3.time.scale.utc().range([100, 800])
                .domain([d3.min(values, function(d){
                    return d.time;
                }), d3.max(values, function(d){
                    return d.time;
                })]);
            var axis = d3.svg.axis()
                .scale(x)
                .ticks(10)
                .tickSize(180, 180, 0);
            var svg = d3.selectAll('.plot svg');
            svg.call(axis);
            var circle = svg.selectAll("circle")
                .data(values);
            circle.enter()
                .append("circle")
                .attr("cy", 90)
                .attr("cx", function(d) { return x(d.time); })
                .attr("r", function(d) { return Math.sqrt(d.score); })
                .attr("class", function(d) { return d.source; })
                .attr("data-title", function(d) { return d.title; })
                .attr("data-href", function(d) { return d.href; })
                .attr("data-score", function(d) { return d.score; })
                .attr("data-date", function(d) { return (d3.time.format('%d %B, %H:%M')(new Date(d.time))); });

            circle.exit().remove()
        },
        clearOverlays: function () {
            $('.overlay').remove();
        },
        createOverlays: function () {
            $('.reddit').each(function(index) {
                var h, view = {
                    url: $(this).attr('data-href'),
                    title: $(this).attr('data-title'),
                    date: $(this).attr('data-date'),
                    score: $(this).attr('data-score'),
                };

                h = $(Mustache.render(templates.reddit, view));
                $('.content').append(h);

                h.css('left', $(this).offset()['left'])
                    .css('top', $(this).offset()['top'] + 100);

                $(this).click(function(){
                    h.fadeIn('fast',
                        function(){
                            $('.content').click(function(){
                                h.fadeOut('fast',
                                    function(){
                                        $('.content').off('click');
                                    });
                            })
                        }
                    )
                });
            });
        },
        chartURL: function (url) {
            $.getJSON("/json?url="+url,
                function(data) {
                    var red = data['reddit_results'];
                    var fb = data['facebook_results'];
                    var results = [];
                    for (var i = 0; i < red.length; i++) {
                        results.push({
                            time: (red[i]['timestamp']*1000),
                            score: red[i]['score'],
                            source: 'reddit',
                            title: red[i]['title'],
                            href: "http://reddit.com/" + red[i]['id']
                        })
                    }
                    for (var i = 0; i < fb.length; i++) {
                        results.push({
                            time: (fb[i]['timestamp']*1000),
                            score: 10,
                            source: 'facebook'
                        })
                    }
                    // if we've not got the html there yet, we need it
                    if (!$('#chart_area').html().trim()) {
                        $('#chart_area').html(Mustache.render(templates.chartHTML, {}));
                    }
                    // clear out data
                    mc.plotOverTime([]);
                    // clear out the old overlays
                    mc.clearOverlays();
                    // do the new data
                    mc.plotOverTime(results);
                    mc.createOverlays();
                    // change button text back
                    $('#submit').attr('value', 'Find it!');
                    $('.key .value.url').text(url);
                    history.pushState(null, null, '/url/' + encodeURIComponent(url));
                });
                // update button text for user feedback
                $('#submit').attr('value', 'Finding...');
        }
    }
    $('#meme_form').submit(function(){
        mc.chartURL($('#url').val());
        return false;
    });

    if (initial) {
        mc.chartURL(initial);
        $('#url').val(initial);
    }
}


$(document).ready(function () {
    'use strict';
    if (window.location.pathname.indexOf('/url') === 0) {
        var url = window.location.pathname.replace('/url/', '');
        memechart(url);
    }
    else {
        memechart();
    }
});

