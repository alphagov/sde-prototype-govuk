-include .env
export

APP_NAME ?= sde_prototype_govuk
ENV ?= development
FLASK_APP ?= $(APP_NAME):app
GOVUK_FRONTEND_VERSION ?= 4.3.1
GOVUK_PUBLISHING_COMPONENTS_VERSION ?= 30.6.1
PORT ?= 8000
STATIC ?= $(APP_NAME)/static

.PHONY: clean-python
clean-python:
	find . \( -name '__pycache__' -and -not -name "venv" \) -d -prune -exec rm -r {} +

.PHONY: clean-static-assets
clean-static-assets:
	rm -rf node_modules
	rm -rf govuk_frontend
	rm -rf govuk_publishing_components
	rm -rf $(STATIC)/images $(STATIC)/fonts $(STATIC)/javascripts
	flask assets clean
	

## clean: Remove temporary and generated files
.PHONY: clean
clean: clean-python clean-static-assets

.PHONY: python-deps
python-deps:
	python -m pip install -U pip
	python -m pip install -r requirements.txt
	[ -f requirements-$(ENV).txt ] && python -m pip install -r requirements-$(ENV).txt

.PHONY: node-deps
node-deps:
	npm install

# install: Install dependencies
.PHONY: install
install: python-deps node-deps

.PHONY: check
check:
	black --check .
	isort --check-only --profile=black --force-single-line-imports .
	flake8 --max-line-length=88 --extend-ignore=E203

.PHONY: fix
fix:
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

# test: Run tests
.PHONY: test
test:
	pytest -x -n=auto --dist=loadfile -W ignore::DeprecationWarning

.PHONY: test-coverage
test-coverage:
	pytest -n=auto --cov --cov-report=xml --cov-report=term -W ignore::DeprecationWarning

# run: Run development server
.PHONY: run
run:
	flask --debug run --debugger --reload --host 0.0.0.0 --port $(PORT)

# docker-image: Build a Docker image
.PHONY: docker-image
docker-image: clean
	docker buildx build \
		--platform linux/amd64 \
		--build-arg GOVUK_FRONTEND_VERSION=$(GOVUK_FRONTEND_VERSION) \
		--build-arg GOVUK_PUBLISHING_COMPONENTS_VERSION=$(GOVUK_PUBLISHING_COMPONENTS_VERSION) \
		-t $(APP_NAME) \
		.

# docker-run: Start a Docker container
.PHONY: docker-run
docker-run:
	docker run \
		--rm \
		--env CONSENT_API_HOST="$(CONSENT_API_HOST)" \
		--env GUNICORN_CMD_ARGS="--bind=0.0.0.0:$(PORT)" \
		-p $(PORT):$(PORT) \
		$(APP_NAME)

## help: Show this message
.PHONY: help
help: Makefile
	@sed -n 's/^##//p' $< | column -t -s ':' | sed -e 's/^/ /'
