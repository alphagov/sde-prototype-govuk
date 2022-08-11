FROM python:3.10-slim

RUN apt-get update && apt-get install -y curl make

WORKDIR /home/app

COPY static/ static/
COPY templates/ templates/
COPY Makefile app.py requirements.txt .

RUN make govuk_assets

RUN pip install -r requirements.txt

ENTRYPOINT flask run --host "0.0.0.0" --port $PORT
