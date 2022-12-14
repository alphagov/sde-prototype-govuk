(function () {
  "use strict"

  function Consent() {
    this.apiURL = "https://consent-api.herokuapp.com/";
    this.sharedUID = Utils.getURLParameter("uid");
    this.localUID = Utils.getCookie("uid");
    this.uid = this.sharedUID || this.localUID;
  }

  Consent.prototype.init = function () {
    this.$cookieBanner = document.querySelector('[data-module~="govuk-cookie-banner"]');
    if (this.$cookieBanner && !this.$cookieBanner.hidden) {
      console.log("Consent.init: adding event listeners to cookie banner buttons")
      this.$cookieBanner.querySelectorAll('[data-accept-cookies]').forEach((button) => {
        button.addEventListener("click", (e) => { this.setStatus(Utils.ALL_COOKIES) });
      });
      this.$cookieBanner.querySelectorAll('[data-reject-cookies]').forEach((button) => {
        button.addEventListener("click", (e) => { this.setStatus(Utils.ESSENTIAL_COOKIES) });
      });
    }

    this.$cookieSettingsForm = document.querySelector('form[data-module~="cookie-settings"]');
    if (this.$cookieSettingsForm) {
      console.log("Consent.init: adding submit listener to cookie settings form");
      this.$cookieSettingsForm.addEventListener("submit", (event) => { this.setStatus(event.target.getFormValues()) });
    }

    if (!this.localUID && this.sharedUID) {
      console.log("Consent.init: UID cookie not set, setting to", this.uid);
      Utils.setCookie("uid", this.uid, {"days": 365});
    }

    this.status = {};

    this.undecorateURL();

    this.getStatus((response) => {
      if (response) {
        console.log("Consent.init: got status response", response);
        if (!this.uid) {
          this.uid = response.uid;
          console.log("Consent.init: got new UID, setting cookie", this.uid);
          Utils.setCookie("uid", this.uid, {"days": 365});
        }
        var meta = Utils.acceptedAdditionalCookies(response.status);
        if (meta.responded) {
          this.status = response.status;
          console.log("Consent.init: setting cookies_policy", this.status)
          Utils.setCookie('cookies_policy', JSON.stringify(this.status), {"days": 365});
          Utils.setCookie('cookies_preferences_set', 'true');
          if (this.$cookieBanner) {
            this.$cookieBanner.hidden = true;
          }
        }
        if (this.$cookieSettingsForm) {
          console.log("Consent.init: update cookies settings form");
          this.$cookieSettingsForm.setFormValues(this.status);
        }
        this.decorateLinks();
      }
    });
  }

  Consent.prototype.undecorateURL = function () {
    console.log("Consent.undecorateURL: before", window.location.href);
    var undecoratedURL = Utils.removeURLParameter(window.location.href, "uid");
    window.history.replaceState(null, null, undecoratedURL);
    console.log("Consent.undecorateURL: after", undecoratedURL);
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
      console.log("Consent.decorateLinks", this.uid);
      var nodes = document.querySelectorAll("[data-consent-share]");
      for (var index = 0; nodes.length > index; index++) {
        nodes[index].addEventListener("click", (event) => {
          if (event.target.hasAttribute("href")) {
            var url = event.target.getAttribute("href");
            var decoratedUrl = Utils.addURLParameter(url, "uid", this.uid);
            console.log("Consent.decorateLinks: decoratedUrl", decoratedUrl);
            event.target.setAttribute("href", decoratedUrl);
          }
        });
      }
      console.log(`Consent.decorateLinks: decorated ${nodes.length} links`);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    new Consent().init();
  });
})()
