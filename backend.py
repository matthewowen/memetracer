import json
import urllib
import requests
import time

user_agent = {'User-agent': 'Memetracer www.memetracer.com'}


class meme(object):

    """
    Class for a particular meme (in this case, understood as a particular URL)
    """

    def get_from_reddit(self):
        """
        Gets usage of the url on reddit.
        Sets self.results to be a list of usages of the url, oldest first
        Each usage has:
            timestamp submitted
            subreddit
            id
            title
            score
            comments
        """
        search_url = "http://www.reddit.com/search.json?" \
            "q=url%%3A%s&sort=new" % self.url
        r = requests.get(search_url, headers=user_agent)
        uses = r.json['data']['children']

        self.reddit_results = []

        while uses:
            i = uses.pop()['data']
            k = {}
            k['timestamp'] = i['created_utc']
            k['subreddit'] = i['subreddit']
            k['id'] = i['id']
            k['title'] = i['title']
            k['score'] = i['score']
            k['comments'] = i['num_comments']
            self.reddit_results.append(k)

    def get_from_facebook(self):
        """
        Gets usage of the url in public Facebook statuses
        Sets self.results to be a list of usages of the url, oldest first
        Each usage has:
            timestamp posted
            id
            message
            user_id
            username
            likes
            shares
        """

        search_url = "http://graph.facebook.com/search?q=%s" \
            "&type=post&date_format=U&limit=5000" % self.url
        r = requests.get(search_url, headers=user_agent)
        uses = []
        # have to set a limit on pages or we'll be here a long time...
        while 'paging' in r.json:
            uses += r.json['data']
            r = requests.get(r.json['paging']['next'])

        self.facebook_results = []

        while uses:
            i = uses.pop()
            k = {}
            k['timestamp'] = i['created_time']
            k['id'] = i['id']
            try:
                k['title'] = i['message'].strip('http://' + self.url)
                if k['title'] == "":
                    k['title'] = 'Untitled status update'
            except KeyError:
                k['title'] = 'Untitled status update'
            k['user_id'] = i['from']['id']
            k['username'] = i['from']['name']
            try:
                k['likes'] = i['likes']['count']
            except KeyError:
                k['likes'] = 0
            try:
                k['shares'] = i['shares']['count']
            except KeyError:
                k['shares'] = 0
            self.facebook_results.append(k)

    def get_from_twitter(self):
        """
        Gets usage of the url in Twitter updates
        Sets self.results to be a list of usages of the url, oldest first
        Each usage has:
            timestamp posted
            id
            message
            user_name
            recent_retweets
        """
        search_url = "http://search.twitter.com/search.json?q=\"%s\"+" \
            "exclude:retweets&result_type=\"popular\"" % self.url
        r = requests.get(search_url, headers=user_agent)
        uses = r.json['results']
        while 'next_page' in r.json:
            r = requests.get("http://search.twitter.com/search.json" +
                             r.json['next_page'])
            uses += r.json['results']

        # now get the popular ones
        search_url = "http://search.twitter.com/search.json?q=\"%s\"+" \
            "exclude:retweets&result_type=popular" % self.url
        r = requests.get(search_url, headers=user_agent)
        # ultimately, should check for duplicates. still need to figure out a
        # nice efficient option for that
        uses += r.json['results']

        self.twitter_results = []
        while uses:
            i = uses.pop()
            k = {}
            t = time.strptime(i['created_at'][0:-6], "%a, %d %b %Y %H:%M:%S")
            k['timestamp'] = time.mktime(t)
            k['id'] = i['id']
            k['title'] = i['text']
            k['username'] = i['from_user']
            try:
                k['recent_retweets'] = i['metadata']['recent_retweets']
            except KeyError:
                k['recent_retweets'] = 0
            self.twitter_results.append(k)

    def get_usage(self):
        """
        Get usage of the url from across the web
        """
        self.get_from_facebook()
        self.get_from_reddit()
        self.get_from_twitter()

    def __init__(self, url):
        """
        Initialisation requires a URL (only a URL)
        """
        self.url = url
