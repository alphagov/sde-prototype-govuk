from flask import Flask
from jinja2 import ChoiceLoader
from jinja2 import PackageLoader
from jinja2 import PrefixLoader
from flask_assets import Environment


app = Flask(__name__, static_url_path="/assets")
assets = Environment(app)
assets.from_module("sde_prototype_govuk.assets")

app.jinja_loader = ChoiceLoader(
    [
        PackageLoader("sde_prototype_govuk"),
        PrefixLoader({"govuk_frontend_jinja": PackageLoader("govuk_frontend_jinja")}),
        PrefixLoader(
            {
                "govuk_publishing_components": PackageLoader(
                    "sde_prototype_govuk.publishing_components"
                )
            }
        ),
    ]
)

import sde_prototype_govuk.views
