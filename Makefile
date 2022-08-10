GOVUK_TMP=tmp_govuk_frontend

govuk_assets: clean_govuk_assets
	@mkdir -p $(GOVUK_TMP)
	@curl -L -s https://github.com/alphagov/govuk-frontend/archive/refs/tags/v4.2.0.tar.gz | tar -xz --strip 1 -C $(GOVUK_TMP)
	@mv $(GOVUK_TMP)/dist/govuk-frontend-*.min.* static/
	@mv $(GOVUK_TMP)/dist/assets/* static/
	@mv $(GOVUK_TMP)/package/govuk/components govuk_components
	@find govuk_components -type f ! -name 'fixtures.json' -delete
	@rm -rf $(GOVUK_TMP)

clean_govuk_assets:
	@rm -rf $(GOVUK_TMP) govuk_components static/images static/fonts

clean: clean_govuk_assets

run_dev_server:
	@flask --app app:app --debug run