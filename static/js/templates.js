var reddit = '\
        <aside class="overlay reddit">\
        <h3><a href="{{url}}" title="{{title}}" target="_blank">{{title}}</a></h3>\
        <dl>\
        <dt>Date:</dt>\
        <dd>{{date}}</dd>\
        <dt>Score:</dt>\
        <dd>{{score}}</dd>\
        </dl>\
    </aside>'

var chartHTML = '\
<aside class="key">\
    <span class="label url">URL:</span><h2 class="value url"></h2>\
</aside>\
<div id="plot_canvas" class="plot chart">\
    <svg width="900" height="200"></svg>\
</div>\
<div class="key chart">\
    <svg width="500" height="100">\
        <circle r="30" cy="50" cx="50" class="reddit"></circle>\
        <text y="57" x="90">Reddit</text>\
        <circle r="30" cy="50" cx="200" class="facebook"></circle>\
        <text y="57" x="240">Facebook</text>\
    </svg>\
</div>'