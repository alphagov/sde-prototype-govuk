import os

from flask_assets import Bundle
from webassets.filter import get_filter

from sprockets_filter import Sprockets


GOVUK_FRONTEND_DIR = "../../govuk_frontend"
GOVUK_FRONTEND_VERSION = os.environ["GOVUK_FRONTEND_VERSION"]
GOVUK_PUBLISHING_COMPONENTS_VERSION = os.environ["GOVUK_PUBLISHING_COMPONENTS_VERSION"]

govuk_frontend_css = Bundle(
    f"{GOVUK_FRONTEND_DIR}/dist/govuk-frontend-{GOVUK_FRONTEND_VERSION}.min.css",
    output=f"govuk-frontend-{GOVUK_FRONTEND_VERSION}.min.css",
)

govuk_frontend_ie8_css = Bundle(
    f"{GOVUK_FRONTEND_DIR}/dist/govuk-frontend-ie8-{GOVUK_FRONTEND_VERSION}.min.css",
    output=f"govuk-frontend-ie8-{GOVUK_FRONTEND_VERSION}.min.css",
)

govuk_frontend_js = Bundle(
    f"{GOVUK_FRONTEND_DIR}/dist/govuk-frontend-{GOVUK_FRONTEND_VERSION}.min.js",
    output=f"govuk-frontend-{GOVUK_FRONTEND_VERSION}.min.js",
)

govuk_publishing_components_css = Bundle(
    "../../govuk_publishing_components/app/assets/stylesheets/govuk_publishing_components/_all_components.scss",
    filters=[
        get_filter(
            "libsass",
            style="compressed",
            includes=[
                "govuk_frontend/src",
                "govuk_publishing_components/app/assets/stylesheets",
            ],
        )
    ],
    output=f"govuk-publishing-components-{GOVUK_PUBLISHING_COMPONENTS_VERSION}.min.css",
)

application_css = Bundle(
    "sass/application.scss",
    depends=["sass/_*.scss"],
    filters=[get_filter("libsass", style="compressed")],
    output="application.css",
)

application_js = Bundle(
    "javascripts/utils.js",
    "javascripts/cookie-banner.js",
    "javascripts/cookies-page.js",
    "javascripts/consent.js",
    filters=[
        get_filter(
            "babel",
            binary="node_modules/@babel/cli/bin/babel.js",
            presets="@babel/env",
        ),
    ],
    output="application.js",
)
