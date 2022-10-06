APP_NAME=sde_prototype_govuk
DOCKER_REPO=gcr.io/govuk-bigquery-analytics
GOVUK_FRONTEND_VERSION=4.3.1
GOVUK_PUBLISHING_COMPONENTS_VERSION=30.6.1
STATIC=$(APP_NAME)/static
VERSION=$(shell cat version)


govuk_frontend:
	mkdir -p govuk_frontend
	curl -L -s https://github.com/alphagov/govuk-frontend/archive/refs/tags/v$(GOVUK_FRONTEND_VERSION).tar.gz | tar -xz --strip 1 -C govuk_frontend

clean_govuk_frontend:
	rm -rf govuk_frontend

govuk_frontend_components: govuk_frontend
	cp -f -R govuk_frontend/package/govuk/components govuk_frontend_components
	find govuk_frontend_components -type f ! -name 'fixtures.json' -delete

.PHONY: clean_govuk_frontend_components
clean_govuk_frontend_components:
	rm -rf govuk_frontend_components

govuk_publishing_components:
	mkdir -p govuk_publishing_components
	curl -L -s https://github.com/alphagov/govuk_publishing_components/archive/refs/tags/v$(GOVUK_PUBLISHING_COMPONENTS_VERSION).tar.gz | tar -xz --strip 1 -C govuk_publishing_components
	rm -rf govuk_publishing_components/lib

.PHONY: clean_govuk_publishing_components
clean_govuk_publishing_components:
	rm -rf govuk_publishing_components

.PHONY: flask_assets
flask_assets: govuk_frontend govuk_publishing_components
	cp -f -R govuk_frontend/dist/assets/* $(STATIC)/
	flask --app $(APP_NAME):app assets build

.PHONY: clean_flask_assets
clean_flask_assets:
	rm -rf $(STATIC)/images $(STATIC)/fonts
	flask --app $(APP_NAME):app assets clean

.PHONY: assets
assets: flask_assets govuk_frontend_components

.PHONY: clean
clean: clean_govuk_frontend_components clean_govuk_frontend clean_govuk_publishing_components clean_flask_assets

run_dev_server: assets
	flask --app $(APP_NAME):app --debug run --debugger --reload

docker-image: assets
	@docker buildx build --platform linux/amd64 -t $(APP_NAME) .
	@docker tag $(APP_NAME) $(APP_NAME):$(VERSION)
	@docker tag $(APP_NAME) $(DOCKER_REPO)/$(APP_NAME):$(VERSION)
	@docker push $(DOCKER_REPO)/$(APP_NAME):$(VERSION)
