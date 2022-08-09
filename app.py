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


@app.route("/")
def index():
    return flask.render_template(
        "homepage.html",
        popular_links=[
            {
                "href": "/",
                "text": "Hexadecimal as a Service",
            },
            {
                "href": "/",
                "text": "As yet unnamed service",
            },
            {
                "href": "/",
                "text": "Some Wordpress site",
            },
        ],
        categories=[
            {
                "title": "Benefits",
                "link": "#benefits",
                "description": "Includes eligibility, appeals, tax credits and Universal Credit",
            },
            {
                "title": "Births, deaths, marriages and care",
                "link": "#births",
                "description": "Parenting, civil partnerships, divorce and Lasting Power of Attorney",
            },
            {
                "title": "Business and self-employed",
                "link": "#business",
                "description": "Tools and guidance for businesses",
            },
            {
                "title": "Childcare and parenting",
                "link": "#childcare",
                "description": "Includes giving birth, fostering, adopting, benefits for children, childcare and schools",
            },
            {
                "title": "Citizenship and living in the UK",
                "link": "#citizenship",
                "description": "Voting, community participation, life in the UK, international projects",
            },
            {
                "title": "Crime, justice and the law",
                "link": "#crime",
                "description": "Legal processes, courts and the police",
            },
            {
                "title": "Disabled people",
                "link": "#disabled",
                "description": "Includes carers, your rights, benefits and the Equality Act",
            },
            {
                "title": "Driving and transport",
                "link": "#driving",
                "description": "Includes vehicle tax, MOT and driving licences",
            },
            {
                "title": "Education and learning",
                "link": "#education",
                "description": "Includes student loans, admissions and apprenticeships",
            },
            {
                "title": "Employing people",
                "link": "#employing",
                "description": "Includes pay, contracts, hiring and redundancies",
            },
            {
                "title": "Environment and countryside",
                "link": "#environment",
                "description": "Includes flooding, recycling and wildlife",
            },
            {
                "title": "Housing and local services",
                "link": "#housing",
                "description": "Owning or renting and council services",
            },
            {
                "title": "Money and tax",
                "link": "#money",
                "description": "Includes debt and Self Assessment",
            },
            {
                "title": "Passports, travel and living abroad",
                "link": "#passports",
                "description": "Includes renewing passports and travel advice by country",
            },
            {
                "title": "Visas and immigration",
                "link": "#visas",
                "description": "Apply to visit, work, study, settle or seek asylum in the UK",
            },
            {
                "title": "Working, jobs and pensions",
                "link": "#working",
                "description": "Includes holidays, finding a job and redundancy",
            },
        ],
        government_activity=[
            {
                "title": "Departments",
                "link": "#departments",
                "description": "Departments, agencies and public bodies",
            },
            {
                "title": "Research and statistics",
                "link": "#research",
                "description": "Reports, analysis and official statistics",
            },
            {
                "title": "News",
                "link": "#news",
                "description": "News stories, speeches, letters and notices",
            },
            {
                "title": "Policy papers and consultations",
                "link": "#policy",
                "description": "Consultations and strategy",
            },
            {
                "title": "Guidance and regulation",
                "link": "#guidance",
                "description": "Detailed guidance, regulations and rules",
            },
            {
                "title": "Transparency documents",
                "link": "#transparency",
                "description": "Data, Freedom of Information releases and corporate reports",
            },
        ],
        ministerial_departments_count=23,
        other_agencies_count="400+",
    )
