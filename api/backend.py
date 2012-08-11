import json
import urllib
import requests
import redis


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
            "q=url%%3A%s&sort=new" % urllib.quote(self.url)
        r = requests.get(search_url)
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
            user_name
        """
        search_url = "http://graph.facebook.com/search?q=http%%3A%%2F%%2F%s" \
            "&type=post&date_format=U" % urllib.quote(self.url)
        r = requests.get(search_url)
        uses = r.json['data']

        self.facebook_results = []

        while uses:
            i = uses.pop()
            k = {}
            k['timestamp'] = i['created_time']
            k['id'] = i['id']
            try:
                k['message'] = i['message']
            except KeyError:
                k['message'] = None
            k['user_id'] = i['from']['id']
            k['user_name'] = i['from']['name']
            self.facebook_results.append(k)

    def get_usage(self):
        """
        Get usage of the url from across the web
        """
        self.get_from_facebook()
        self.get_from_reddit()

    def __init__(self, url):
        """
        Initialisation requires a URL (only a URL)
        """
        self.url = url
