function memechart (initial) {
    'use strict'
    var mc = {
        chartURL: function (url) {
            $.getJSON("/json?url="+url,
                function(data) {
                    // arrays of the data and results, and a value to track
                    // the largest score (to size relatively)
                    var results = [], largest = 0, unprocessed = [
                        {
                            name: 'reddit',
                            data: data['reddit_results']
                        },
                        {
                            name: 'facebook',
                            data: data['facebook_results']
                        },
                        {
                            name: 'twitter',
                            data: data['twitter_results']
                        }
                    ];
                    // iterate over all the data sources
                    for (var i = 0; i < unprocessed.length; i++) {
                        var l = unprocessed[i];
                        // iterate over all the data points in each source
                        for (var k = 0; k < l.data.length; k++) {
                            // process the data point, update var largest if
                            // required, push into results
                            var processed = mc.processItem(l.data[k], l.name);
                            if (processed.score > largest) {
                                largest = processed.score;
                            }
                            results.push(processed);
                        }
                    }
                    // get the html for the plot area if we've not got it yet
                    if (!$('#chart_area').html().trim()) {
                        $('#chart_area').html(Mustache.render(
                            templates.chartHTML, {}
                        ));
                    }
                    // let's also set up toggling all overlays on and off
                    mc.establishToggle();
                    // clear out data
                    mc.plotOverTime([]);
                    // clear out the old overlays
                    mc.clearOverlays();
                    // change button text and waiting area back
                    // put the svg stuff in once done
                    // doing it after make it smoother to animate
                    $('#submit').attr('value', 'Find it!');
                    $('#waiting').toggle(400, function(){
                        $('#chart_area').animate({
                            marginTop: 0
                        }, 300, function(){
                            // put the new data in
                            mc.plotOverTime(results, largest);
                            mc.createOverlays();
                        })
                    });
                    // update text field and url
                    $('.key .value.url').text(decodeURIComponent(url));
                    history.pushState(null, null, '/url/' + mc.formatURI(url));
                });
                // update button text and waiting area for user feedback
                mc.waitingMode();
        },
        clearOverlays: function () {
            // wipe out old overlays when we have new data
            
            $('.overlay').remove();
        },
        createOverlays: function () {
            // manager function for creating overlays for all the data points

            $('#plot_canvas circle').each(function(){
                mc.overlayDOM(mc.overlayBuilder(this), this)
            });
        },
        establishToggle: function() {
            // set up each circle in the key to toggle its data points
            $('.key circle').each(function(){
                $(this).click(function(){
                    $('#plot_canvas circle.' + $(this).attr('data-source'))
                                                      .toggle();
                })
            })
        },
        formatURI: function (url) {
            // checks if the url has been encoded already, encodes it if it
            // hasn't. otherwise, we keep reencoding the same url, which
            // breaks stuff.

            if (url.indexOf('/') !== -1 || url.indexOf(':') !== -1) {
                return encodeURIComponent(url);
            }
            else {
                return url;
            }
        },
        overlayBuilder: function(node) {
            // builds out overlay html using mustache templates, dependent
            // on what the source is.

            var h, view = {
                url: $(node).attr('data-href'),
                title: $(node).attr('data-title'),
                date: $(node).attr('data-date'),
                score: $(node).attr('data-score')
            };
            switch($(node).attr('data-source')) {
                case 'reddit':
                    return $(Mustache.render(templates.reddit, view));
                case 'facebook':
                    view.likes = $(node).attr('data-likes');
                    view.shares = $(node).attr('data-shares');
                    view.user = $(node).attr('data-user');
                    return $(Mustache.render(templates.facebook, view));
                case 'twitter':
                    view.retweets = $(node).attr('data-retweets');
                    view.user = $(node).attr('data-user');
                    return $(Mustache.render(templates.twitter, view));
            }
        },
        overlayDOM: function(h, parent) {
            // puts overlays into the DOM and adds appropriate event handlers
            
            $('.content').append(h);
            // position the overlay nicely
            h.css('left', $(parent).offset()['left'])
                .css('top', $(parent).offset()['top'] + 100);
            // whenever an overlay is clicked, fade out visible overlays and
            // fade this overlay in.
            $(parent).click(function(){
                $('.overlay').each(function(){
                    $(this).fadeOut('fast');
                })
                h.fadeIn('fast');
            });
        },
        plotOverTime: function (values, largest) {
            // takes care of plotting the data, including scaling circle radiues
            // appropriately, and adding in a sensible scale.

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
            // this next bit has a lot of specific logic. it'd be nice to
            // generalise it (just iterate over the objects properties and
            // set a data- attribute for each one)
            circle.enter()
                .append("circle")
                .attr("cy", 90)
                .attr("cx", function(d) { return x(d.time); })
                .attr("r", function(d) {
                    return Math.sqrt(d.score * (5000 / largest));
                })
                .attr("class", function(d) { return d.source; })
                .attr("data-source", function(d) { return d.source; })
                .attr("data-title", function(d) { return d.title; })
                .attr("data-href", function(d) { return d.href; })
                .attr("data-score", function(d) { return d.score; })
                .attr("data-likes", function(d) { return d.likes; })
                .attr("data-shares", function(d) { return d.shares; })
                .attr("data-retweets", function(d) { return d.retweets; })
                .attr("data-user", function(d) { return d.user; })
                .attr("data-date", function(d) {
                    return (d3.time.format('%d %B, %H:%M')(new Date(d.time)));
                });
            circle.exit().remove();
        },
        processItem: function (item, source) {
            // put together the appropriate object for each array item, based
            // on attributes and source of item

            // some general stuff (some of this is specific, but having some
            // properties set as undefined is a moot point really)
            var obj = {
                time: (item['timestamp']*1000),
                title: item['title'],
                shares: item['shares'],
                likes: item['likes'],
                user: item['username'],
                retweets: item['recent_retweets'],
                source: source
            };

            // this is logic that does need to differ (like figuring out
            // what the score should be)
            switch (source) {
                case 'reddit':
                    obj.score = item['score'];
                    obj.href = "http://reddit.com/" + item['id'];
                    break;
                case 'facebook':
                    obj.score = ((obj.shares + obj.likes) || 1);
                    break;
                case 'twitter':
                    obj.score = (obj.retweets || 1);
                    break;
            }

            return obj;
        },
        waitingMode: function() {
            // does a lot of basic aesthetic stuff to make the site look nice
            // whilst the user is waiting to get their data back
            $('#submit').attr('value', 'Finding...');
                $('#chart_area').animate({
                    marginTop: $('#waiting').height()
                }, 300, function(){
                    $('#waiting').toggle(400);
                });
                // remove centered class and properties from body
                $('body.centered').animate({
                    marginTop: 0
                }, 1000, function(){
                    $('body').removeClass('centered')
                });
        }
    }
    // when user clicks submit, we wanna do our thing and stop the actual
    // form submit happening
    $('#meme_form').submit(function(){
        mc.chartURL($('#url').val());
        return false;
    });

    // if there's an initial value passed (via the url) we should plot it
    if (initial) {
        mc.chartURL(initial);
        $('#url').val(decodeURIComponent(initial));
    }
}


$(document).ready(function () {
    'use strict';
    // look at the url - if there's an initial value, pass it. otherwise we
    // run the function without an initial value
    if (window.location.pathname.indexOf('/url') === 0) {
        var url = window.location.pathname.replace('/url/', '');
        memechart(url);
    }
    else {
        memechart();
    }
});

