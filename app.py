import flask
from jinja2 import ChoiceLoader
from jinja2 import PackageLoader
from jinja2 import PrefixLoader


app = flask.Flask(__name__, static_url_path="/assets")


app.jinja_loader = ChoiceLoader(
    [
        PackageLoader("govuk"),
        PrefixLoader({"govuk_frontend_jinja": PackageLoader("govuk_frontend_jinja")}),
    ]
)


@app.route("/")
def index():
    return flask.render_template("homepage.html")
