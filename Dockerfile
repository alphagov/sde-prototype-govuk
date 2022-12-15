FROM python:3.10-slim AS build

WORKDIR /home/app

RUN python -m venv /home/app/venv
ENV PATH="/home/app/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


FROM python:3.10-slim@sha256:030ead045da5758362ae198e9025671f22490467312dbad9af6b29a6d6bc029b

RUN groupadd -g 999 app && \
    useradd -r -u 999 -g app app
USER 999
WORKDIR /home/app

COPY --chown=app:app --from=build /home/app/venv ./venv
COPY --chown=app:app sde_prototype_govuk/ sde_prototype_govuk/
COPY --chown=app:app govuk_frontend/ govuk_frontend/
COPY --chown=app:app govuk_publishing_components/ govuk_publishing_components/

ARG GOVUK_FRONTEND_VERSION
ENV GOVUK_FRONTEND_VERSION=${GOVUK_FRONTEND_VERSION:-4.3.1}
ARG GOVUK_PUBLISHING_COMPONENTS_VERSION
ENV GOVUK_PUBLISHING_COMPONENTS_VERSION=${GOVUK_PUBLISHING_COMPONENTS_VERSION:-30.6.1}
ENV PATH="/home/app/venv/bin:$PATH"
ENV FLASK_DEBUG=False

CMD gunicorn sde_prototype_govuk:app
