"""Fake GOV.UK app."""
import os

from flask import Flask
from flask_assets import Environment
from jinja2 import ChoiceLoader
from jinja2 import PackageLoader
from jinja2 import PrefixLoader

app = Flask(__name__, static_url_path="/assets")
assets = Environment(app)
assets.from_module("sde_prototype_govuk.assets")

app.jinja_env.globals["getenv"] = os.getenv
app.jinja_env.globals["container_ids"] = {
    "GA4": "GTM-TTVXKG3",
    "UA": "GTM-5S9XWS6",
}


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

import sde_prototype_govuk.views  # noqa
