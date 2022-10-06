(function () {
  function CookieBanner($module) {
    this.$module = $module;
  }

  CookieBanner.prototype.init = function () {
    console.log('initializing Cookie Banner', this.$module);
    this.cookies_preferences_set = Utils.getCookie('cookies_preferences_set') === 'true'
    console.log('cookies_preferences_set', this.cookies_preferences_set)
    this.cookies_policy = JSON.parse(Utils.getCookie('cookies_policy', '{}'))
    console.log('cookies_policy', this.cookies_policy)

    this.$module.message = this.$module.querySelector('.js-cookie-banner-message');
    this.$module.confirmAccept = this.$module.querySelector('.js-cookie-banner-confirmation-accept');
    this.$module.confirmReject = this.$module.querySelector('.js-cookie-banner-confirmation-reject');

    this.$module.setCookieConsent = this.acceptCookies.bind(this);
    this.$module.showAcceptConfirmation = this.showAcceptConfirmation.bind(this);
    this.$module.querySelector('[data-accept-cookies]').addEventListener('click', this.$module.setCookieConsent)
    this.$module.rejectCookieConsent = this.rejectCookies.bind(this);
    this.$module.showRejectConfirmation = this.showRejectConfirmation.bind(this);
    this.$module.querySelector('[data-reject-cookies]').addEventListener('click', this.$module.rejectCookieConsent)

    var nodes = this.$module.querySelectorAll('[data-hide-cookie-message]')
    for (var i = 0, length = nodes.length; i < length; i++) {
      nodes[i].addEventListener("click", this.hideBanner.bind(this))
    }

    this.showBanner();
  }

  CookieBanner.prototype.showBanner = function () {
    var meta = Utils.acceptedAdditionalCookies(this.cookies_policy);
    console.log('responded', meta.responded)
    console.log('acceptedAdditionalCookies', meta.acceptedAdditionalCookies)

    this.$module.hidden = this.cookies_preferences_set;
    if (!this.cookies_preferences_set) {
      Utils.setCookie('cookies_preferences_set', 'true', {'days': 365});
    }
    this.$module.confirmAccept.hidden = !meta.responded || !meta.acceptedAdditionalCookies;
    this.$module.confirmReject.hidden = !meta.responded || meta.acceptedAdditionalCookies;
  }

  CookieBanner.prototype.hideBanner = function () {
    this.$module.hidden = true;
  }

  CookieBanner.prototype.acceptCookies = function () {
    console.log("accepting cookies")
    this.$module.showAcceptConfirmation();
    console.log("CookieBanner.acceptCookies: setting ALL_COOKIES")
    Utils.setCookie('cookies_policy', JSON.stringify(Utils.ALL_COOKIES), {'days': 365})
    Utils.setCookie('cookies_preferences_set', 'true', {'days': 365})
  }

  CookieBanner.prototype.showAcceptConfirmation = function () {
    this.$module.message.hidden = true
    this.$module.confirmAccept.hidden = false
    this.$module.confirmAccept.focus()
  }

  CookieBanner.prototype.rejectCookies = function () {
    console.log('rejecting cookies')
    this.$module.showRejectConfirmation();
    console.log("CookieBanner.rejectCookies: setting ESSENTIAL_COOKIES")
    Utils.setCookie('cookies_policy', JSON.stringify(Utils.ESSENTIAL_COOKIES), {'days': 365})
    Utils.setCookie('cookies_preferences_set', 'true', {'days': 365})
  }

  CookieBanner.prototype.showRejectConfirmation = function () {
    this.$module.message.hidden = true
    this.$module.confirmReject.hidden = false
    this.$module.confirmReject.focus()
  }

  window.CookieBanner = CookieBanner;

  document.addEventListener('DOMContentLoaded', function () {
    const nodes = document.querySelectorAll('[data-module~="govuk-cookie-banner"]')
    for (var i = 0, length = nodes.length; i < length; i++) {
      new CookieBanner(nodes[i]).init();
    }
  });
})()
