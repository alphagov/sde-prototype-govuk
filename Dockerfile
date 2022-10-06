FROM python:3.10-slim

WORKDIR /home/app

COPY sde_prototype_govuk/ sde_prototype_govuk/
COPY govuk_frontend/ govuk_frontend/
COPY govuk_publishing_components/ govuk_publishing_components/
COPY sprockets_filter.py requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

ENV GOVUK_FRONTEND_VERSION="4.3.1"
ENV GOVUK_PUBLISHING_COMPONENTS_VERSION="30.6.1"

ENTRYPOINT gunicorn sde_prototype_govuk:app
