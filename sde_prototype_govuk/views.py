from markdown import markdown
from flask import render_template

from sde_prototype_govuk import app


CONTAINER_IDS = {
    "GA4": "GTM-TTVXKG3",
    "UA": "GTM-5S9XWS6",
}

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
        "href": "http://localhost:5000",
        # "href": "https://haas-eboe7b6oiq-nw.a.run.app/",
    },
    "Apply_juggling_licence_ga4": {
        "title": "Juggling campaign page GA4 route",
        "intro": markdown(
            """Prototype sandbox campaign page that links to prototype juggling services differnt GA tagging on 
            each service - campaign page built in word press"""
        ),
        "href": "https://wordpress-ga4-j4f7bdslta-nw.a.run.app",
    },
    "Apply_juggling_licence_ua360": {
        "title": "Juggling campaign page universal analytics route",
        "intro": markdown(
            """Prototype sandbox campaign page that links to prototype juggling services differnt GA tagging on 
            each service - campaign page built in word press"""
        ),
        "href": "https://wordpress-j4f7bdslta-nw.a.run.app",
    },
}


@app.route("/")
def index():
    return render_template(
        "homepage.html",
        services=SERVICES,
        container_ids=CONTAINER_IDS,
    )


@app.route("/start/<service_name>")
def start_page(service_name):
    return render_template(
        "start_page.html",
        service=SERVICES[service_name],
        container_ids=CONTAINER_IDS,
    )


@app.get("/help/cookies")
def cookies():
    return render_template("cookies.html")