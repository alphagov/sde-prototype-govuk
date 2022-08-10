from markdown import markdown

import flask
from jinja2 import ChoiceLoader
from jinja2 import PackageLoader
from jinja2 import PrefixLoader


app = flask.Flask(__name__, static_url_path="/assets")


app.jinja_loader = ChoiceLoader(
    [
        PackageLoader("app"),
        PrefixLoader({"govuk_frontend_jinja": PackageLoader("govuk_frontend_jinja")}),
    ]
)


SERVICES = {
    "haas": {
        "title": "Hexagrams as a Service",
        "intro": markdown(
            """The I Ching book consists of 64 hexagrams. A hexagram in this context is
            a figure composed of six stacked horizontal lines, where each line is either
            Yang (an unbroken, or solid line), or Yin (broken, an open line with a gap
            in the center). The hexagram lines are traditionally counted from the bottom
            up, so the lowest line is considered line one while the top line is line
            six. Hexagrams are often formed by combining the original eight trigrams in
            different combinations. Each hexagram is accompanied with a description,
            often cryptic, akin to parables. Each line in every hexagram is also given a
            similar description."""
        ),
        "href": "",
    },
    "unnamed": {
        "title": "As yet unnamed service",
        "intro": "",
        "href": "",
    },
    "wordpress": {
        "title": "Some Wordpress site",
        "intro": "",
        "href": "",
    },
}


@app.route("/")
def index():
    return flask.render_template("homepage.html", services=SERVICES)


@app.route("/start/<service_name>")
def start_page(service_name):
    return flask.render_template(
        "start_page.html",
        service=SERVICES[service_name],
    )