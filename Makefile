-include .env
export

APP_NAME ?= sde_prototype_govuk
ENV ?= development
FLASK_APP ?= $(APP_NAME):app
GOVUK_FRONTEND_VERSION ?= $(shell cat .govuk_frontend_version)
GOVUK_PUBLISHING_COMPONENTS_VERSION ?= $(shell cat .govuk_publishing_components_version)
PORT ?= 8000

.PHONY: clean
clean:
	find . \( -name '__pycache__' -and -not -name "venv" \) -d -prune -exec rm -r {} +

.PHONY: full-clean
full-clean: clean
	rm -rf node_modules
	rm -rf govuk_frontend
	rm -rf govuk_publishing_components
	rm -rf $(STATIC)/images $(STATIC)/fonts $(STATIC)/javascripts
	flask assets clean

.PHONY: python-deps
python-deps:
	python -m pip install -U pip
	python -m pip install -r requirements.txt
	[ -f requirements-$(ENV).txt ] && python -m pip install -r requirements-$(ENV).txt

.PHONY: node-deps
node-deps:
	npm install

.PHONY: deps
deps: python-deps node-deps

.PHONY: lint
lint:
	black --check .
	isort --check-only --profile=black --force-single-line-imports .
	flake8 --max-line-length=88 --extend-ignore=E203

.PHONY: lint-fix
lint-fix:
	pre-commit run --all-files

govuk_frontend:
	mkdir -p govuk_frontend
	curl -L -s https://github.com/alphagov/govuk-frontend/archive/refs/tags/v$(GOVUK_FRONTEND_VERSION).tar.gz | tar -xz --strip 1 -C govuk_frontend

govuk_publishing_components:
	mkdir -p govuk_publishing_components
	curl -L -s https://github.com/alphagov/govuk_publishing_components/archive/refs/tags/v$(GOVUK_PUBLISHING_COMPONENTS_VERSION).tar.gz | tar -xz --strip 1 -C govuk_publishing_components
	rm -rf govuk_publishing_components/lib

.PHONY: consent_api
consent_api:
	mkdir -p $(STATIC)/javascripts
	cp node_modules/@alphagov/consent-api/client/src/*.js $(STATIC)/javascripts/

.PHONY: assets
assets: govuk_frontend govuk_publishing_components consent_api
	cp -f -R govuk_frontend/dist/assets/* $(STATIC)/
	flask assets build

.PHONY: test
test:
	pytest -x -n=auto --dist=loadfile -W ignore::DeprecationWarning

.PHONY: test-coverage
test-coverage:
	pytest -n=auto --cov --cov-report=xml --cov-report=term -W ignore::DeprecationWarning

.PHONY: run
run:
	flask --debug run --debugger --reload --host 0.0.0.0 --port $(PORT)

.PHONY: docker-image
docker-image: clean
	docker buildx build \
		--platform linux/amd64 \
		--build-arg GOVUK_FRONTEND_VERSION=$(GOVUK_FRONTEND_VERSION) \
		--build-arg GOVUK_PUBLISHING_COMPONENTS_VERSION=$(GOVUK_PUBLISHING_COMPONENTS_VERSION) \
		-t $(APP_NAME) \
		.

.PHONY: docker-run
docker-run:
	docker run \
		--rm \
		--env CONSENT_API_HOST="$(CONSENT_API_HOST)" \
		--env GUNICORN_CMD_ARGS="--bind=0.0.0.0:$(PORT)" \
		-p $(PORT):$(PORT) \
		$(APP_NAME)
