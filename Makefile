govuk_assets: clean_govuk_assets
	@mkdir -p tmp_govuk_frontend
	@curl -L -s https://github.com/alphagov/govuk-frontend/archive/refs/tags/v4.2.0.tar.gz | tar -xz --strip 1 -C tmp_govuk_frontend
	@mv tmp_govuk_frontend/dist/*.min.{css,js} static
	@mv tmp_govuk_frontend/dist/assets/* static
	@mv tmp_govuk_frontend/package/govuk/components govuk_components
	@find govuk_components -type f ! -name 'fixtures.json' -delete
	@rm -rf tmp_govuk_frontend

clean_govuk_assets:
	@rm -rf govuk_components tmp_govuk_frontend static/images static/fonts

clean: clean_govuk_assets

run_dev_server:
	@flask --app app:app --debug run
