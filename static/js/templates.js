var templates = {
    reddit: '\
        <aside class="overlay reddit">\
        <h3><a href="{{url}}" title="{{title}}" target="_blank">{{title}}</a></h3>\
        <dl>\
        <dt>Date:</dt>\
        <dd>{{date}}</dd>\
        <dt>Score:</dt>\
        <dd>{{score}}</dd>\
        </dl>\
    </aside>',
    facebook: '\
        <aside class="overlay facebook">\
        <h3>{{title}}</h3>\
        <dl>\
        <dt>User:</dt>\
        <dd>{{user}}</dd>\
        <dt>Date:</dt>\
        <dd>{{date}}</dd>\
        <dt>Likes:</dt>\
        <dd>{{likes}}</dd>\
        <dt>Shares:</dt>\
        <dd>{{shares}}</dd>\
        </dl>\
    </aside>',
    twitter: '\
        <aside class="overlay twitter">\
        <h3>{{title}}</h3>\
        <dl>\
        <dt>User:</dt>\
        <dd>{{user}}</dd>\
        <dt>Date:</dt>\
        <dd>{{date}}</dd>\
        <dt>Recent retweets:</dt>\
        <dd>{{retweets}}</dd>\
        </dl>\
    </aside>',
    chartHTML: '\
    <aside class="key">\
        <span class="label url">URL:</span><h2 class="value url"></h2>\
    </aside>\
    <div id="plot_canvas" class="plot chart">\
        <svg width="900" height="200"></svg>\
    </div>\
    <div class="key chart">\
        <svg width="500" height="100">\
            <circle r="30" cy="50" cx="50" class="reddit" data-source="reddit"></circle>\
            <text y="57" x="90">Reddit</text>\
            <circle r="30" cy="50" cx="200" class="facebook" data-source="facebook"></circle>\
            <text y="57" x="240">Facebook</text>\
            <circle r="30" cy="50" cx="370" class="twitter" data-source="twitter"></circle>\
            <text y="57" x="410">Twitter</text>\
        </svg>\
    </div>'
}