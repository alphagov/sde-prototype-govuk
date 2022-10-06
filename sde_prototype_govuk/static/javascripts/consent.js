(function () {
  "use strict"

  function Consent($module) {
    this.$module = $module;
    this.apiURL = "https://consent-api.herokuapp.com/";
    this.sharedUID = Utils.getURLParameter("uid");
    this.localUID = Utils.getCookie("uid");
    this.uid = this.sharedUID || this.localUID;
  }

  Consent.prototype.init = function () {
    this.$cookieBanner = document.querySelector('[data-module~="govuk-cookie-banner"]');
    if (this.$cookieBanner) {
      this.$cookieBanner.querySelectorAll('[data-accept-cookies]').forEach((button) => {
        button.addEventListener("click", (e) => { this.setStatus() });
      });
      this.$cookieBanner.querySelectorAll('[data-reject-cookies]').forEach((button) => {
        button.addEventListener("click", (e) => { this.setStatus() });
      });
    }

    this.$cookieSettingsForm = document.querySelector('form[data-module~="cookie-settings"]');
    if (this.$cookieSettingsForm) {
      this.$cookieSettingsForm.addEventListener("submit", (event) => { this.setStatus(event.target.getFormValues()) });
    }

    this.status = {};

    this.undecorateURL();

    this.getStatus((response) => {
      if (response) {
        if (this.uid === null) {
          this.uid = response.uid;
          Utils.setCookie("uid", this.uid, {"days": 365});
        }
        var meta = Utils.acceptedAdditionalCookies(response.status);
        if (meta.responded) {
          this.status = response.status;
          console.log("Consent.init: setting cookies_policy", this.status)
          Utils.setCookie('cookies_policy', JSON.stringify(this.status), {"days": 365});
          this.updateCookieBanner(meta.acceptedAdditionalCookies);
        }
        if (this.$cookieSettingsForm) {
          this.$cookieSettingsForm.setFormValues(this.status);
        }
        this.decorateLinks();
      }
    });
  }

  Consent.prototype.undecorateURL = function () {
    window.history.replaceState(null, null, Utils.removeURLParameter(window.location.href, "uid"));
  }

  Consent.prototype.getApiEndpoint = function () {
    return this.apiURL.concat("consent", this.uid ? "/".concat(this.uid) : "");
  }

  Consent.prototype.getStatus = function (callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState === XMLHttpRequest.DONE) {
        var responseJSON = {};
        if (request.status === 0 || (request.status >= 200 && request.status < 400)) {
          responseJSON = JSON.parse(request.responseText);
        }
        callback(responseJSON);
      }
    };
    request.open("GET", this.getApiEndpoint());
    request.send();
  }

  Consent.prototype.setStatus = function (status) {
    this.status = (status || this.status);
    var request = new XMLHttpRequest();
    request.open("POST", this.getApiEndpoint());
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("status=".concat(JSON.stringify(this.status)));
  }

  Consent.prototype.decorateLinks = function () {
    if (this.uid) {
      var nodes = document.querySelectorAll("[data-consent-share]");
      for (var index = 0; nodes.length > index; index++) {
        nodes[index].addEventListener("click", (event) => {
          if (event.target.hasAttribute("href")) {
            event.target.setAttribute(
              "href",
              Utils.addURLParameter(event.target.getAttribute("href"), "uid", this.uid),
            );
          }
        });
      }
    }
  }

  Consent.prototype.updateCookieBanner = function (accepted) {
    const banner = document.querySelector('[data-module~="govuk-cookie-banner"]')
    if (banner) {
      banner.message.hidden = true;
      if (accepted) {
        banner.showAcceptConfirmation();
      } else {
        banner.showRejectConfirmation();
      }
    }
  }

  Consent.prototype.updateCookieForm = function () {
  }

  document.addEventListener("DOMContentLoaded", () => {
    const nodes = document.querySelectorAll('[data-module~="consent"]');
    for (var index = 0; nodes.length > index; index++) {
      new Consent(nodes[index]).init();
    }
  });
})()
