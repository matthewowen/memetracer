import flask
import backend
import json

app = flask.Flask(__name__)


@app.route('/url')
def url_info():
    """
    Returns JSON with usage info about a particular url
    """
    if not flask.request.args.get('url'):
        return json.dumps({
            error: 'No URL supplied'
        })
    m = backend.meme(flask.request.args.get('url').lstrip('http://'))
    m.get_usage()
    return json.dumps(m.__dict__)

# RUN CONFIG

if app.config['DEBUG']:
    from werkzeug import SharedDataMiddleware
    import os
    app.wsgi_app = SharedDataMiddleware(
        app.wsgi_app, {'/': os.path.join(
            os.path.dirname(__file__), 'static')
        }
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
