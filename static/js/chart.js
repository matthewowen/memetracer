function memechart (initial) {
    'use strict'
    var mc = {
        // takes care of plotting the data, including scaling circle radiues
        // appropriately, and adding in a sensible scale.
        plotOverTime: function (values, largest) {
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
                .attr("r", function(d) {
                    return Math.sqrt(d.score * (5000 / largest));
                })
                .attr("class", function(d) { return d.source; })
                .attr("data-title", function(d) { return d.title; })
                .attr("data-href", function(d) { return d.href; })
                .attr("data-score", function(d) { return d.score; })
                .attr("data-likes", function(d) { return d.likes; })
                .attr("data-shares", function(d) { return d.shares; })
                .attr("data-retweets", function(d) { return d.recent_retweets; })
                .attr("data-user", function(d) { return d.user; })
                .attr("data-date", function(d) {
                    return (d3.time.format('%d %B, %H:%M')(new Date(d.time)));
                });

            circle.exit().remove()
        },
        clearOverlays: function () {
            // wipe out old overlays when we have new data
            $('.overlay').remove();
        },
        overlayDOM: function(h, parent) {
            // puts overlays into the DOM and adds appropriate event handlers
            $('.content').append(h);

            h.css('left', $(parent).offset()['left'])
                .css('top', $(parent).offset()['top'] + 100);

            $(parent).click(function(){
                $('.overlay').each(function(){
                    $(this).fadeOut('fast');
                })
                h.fadeIn('fast');
            });
        },
        createOverlays: function () {
            // creates the overlays for all the data points
            // dom manipulation is abstracted out (it's the same for all
            // sources). ideally, should abstract out more of this.
            $('#plot_canvas .reddit').each(function(index) {
                var h, view = {
                    url: $(this).attr('data-href'),
                    title: $(this).attr('data-title'),
                    date: $(this).attr('data-date'),
                    score: $(this).attr('data-score')
                };
                h = $(Mustache.render(templates.reddit, view));
                mc.overlayDOM(h, this);
            });
            $('#plot_canvas .facebook').each(function() {
                var h, view = {
                    url: $(this).attr('data-href'),
                    title: $(this).attr('data-title'),
                    date: $(this).attr('data-date'),
                    likes: $(this).attr('data-likes'),
                    shares: $(this).attr('data-shares'),
                    user: $(this).attr('data-user')
                };
                h = $(Mustache.render(templates.facebook, view));
                mc.overlayDOM(h, this);
            });
            $('#plot_canvas .twitter').each(function() {
                var h, view = {
                    url: $(this).attr('data-href'),
                    title: $(this).attr('data-title'),
                    date: $(this).attr('data-date'),
                    retweets: $(this).attr('data-retweets'),
                    user: $(this).attr('data-user')
                };
                h = $(Mustache.render(templates.twitter, view));
                mc.overlayDOM(h, this);
            });
        },
        calculateFBScore: function(shares, likes) {
            // takes likes and shares, gives back a sensible
            // score, weighted to be reasonably relative to reddit
            if (likes + shares === 0) {
                return 1;
            }
            return (likes + shares);
        },
        calculateTwitScore: function(rt) {
            if (rt === 0) {
                return 1;
            }
            return rt;
        },
        establishToggle: function(url) {
            $('.key circle').each(function(){
                $(this).click(function(){
                    $('#plot_canvas circle.'+ $(this).attr('data-source')).toggle()
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
                return url
            }
        },
        chartURL: function (url) {
            $.getJSON("/json?url="+url,
                function(data) {
                    // arrays of the data and results, and a value to track
                    // the largest score (to size relatively)
                    var red = data['reddit_results'];
                    var fb = data['facebook_results'];
                    var twit = data['twitter_results'];
                    var results = [];
                    var largest = 0;
                    // i should probably abstract some of this out to
                    // avoid repetition
                    for (var i = 0; i < red.length; i++) {
                        var k = {
                            time: (red[i]['timestamp']*1000),
                            score: red[i]['score'],
                            source: 'reddit',
                            title: red[i]['title'],
                            href: "http://reddit.com/" + red[i]['id']
                        }
                        results.push(k)
                        if (k['score'] > largest) {
                            largest = k['score'];
                        }
                    }
                    for (var i = 0; i < fb.length; i++) {
                        var k = {
                            time: (fb[i]['timestamp']*1000),
                            shares: fb[i]['shares'],
                            likes: fb[i]['likes'],
                            source: 'facebook',
                            title: fb[i]['title'],
                            user: fb[i]['username']
                        }
                        k['score'] = mc.calculateFBScore(k['shares'], k['likes']);
                        results.push(k);
                        if (k['score'] > largest) {
                            largest = k['score'];
                        }
                    }
                    for (var i = 0; i < twit.length; i++) {
                        var k = {
                            time: (twit[i]['timestamp']*1000),
                            recent_retweets: twit[i]['recent_retweets'],
                            source: 'twitter',
                            title: twit[i]['message'],
                            user: twit[i]['username']
                        }
                        k['score'] = mc.calculateTwitScore(k.recent_retweets);
                        results.push(k)
                        if (k['score'] > largest) {
                            largest = k['score'];
                        }
                    }
                    // if we've not got the html there yet, we need it
                    if (!$('#chart_area').html().trim()) {
                        $('#chart_area').html(Mustache.render(templates.chartHTML, {}));
                    }
                    // let's also set up toggling all overlays on and off
                    mc.establishToggle();
                    // clear out data
                    mc.plotOverTime([]);
                    // clear out the old overlays
                    mc.clearOverlays();
                    // change button text and waiting area back
                    // put the svg stuff in once done (makes it smoother to animate)
                    $('#submit').attr('value', 'Find it!');
                    $('#waiting').toggle(400, function(){
                        $('#chart_area').animate({
                            marginTop: 0
                        }, 300, function(){
                            // do the new data
                            mc.plotOverTime(results, largest);
                            mc.createOverlays();
                        })
                    });
                    // update text field and url
                    $('.key .value.url').text(decodeURIComponent(url));
                    history.pushState(null, null, '/url/' + mc.formatURI(url));
                });
                // update button text and waiting area for user feedback
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
                })
        }
    }
    $('#meme_form').submit(function(){
        mc.chartURL($('#url').val());
        return false;
    });

    if (initial) {
        mc.chartURL(initial);
        $('#url').val(decodeURIComponent(initial));
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

