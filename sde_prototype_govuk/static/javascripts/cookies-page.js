(function () {
  function CookieSettings ($module) {
    this.$module = $module
  }

  CookieSettings.prototype.init = function () {
    console.log("CookieSettings.init")
    this.$module.submitSettingsForm = this.submitSettingsForm.bind(this)
    this.$module.getFormValues = this.getFormValues.bind(this);
    this.$module.setFormValues = this.setFormValues.bind(this);

    console.log("add cookies page submit handler")
    document.querySelector('form[data-module=cookie-settings]')
      .addEventListener('submit', this.$module.submitSettingsForm)


    this.cookies_policy = JSON.parse(Utils.getCookie('cookies_policy'));
    if (!this.cookies_policy) {
      console.log("CookieSettings.init: setting ESSENTIAL_COOKIES")
      this.cookies_policy = Utils.ESSENTIAL_COOKIES;
      Utils.setCookie('cookies_policy', JSON.stringify(this.cookies_policy), {"days": 365});
    }

    this.setFormValues(this.cookies_policy)
  }

  CookieSettings.prototype.setFormValues = function (cookies_policy) {
    cookies_policy ||= this.cookies_policy
    console.log("CookieSettings.setFormValues: ", cookies_policy)

    for (var category in cookies_policy) {
      if (category === "essential") {
        // this cannot be set by the user
        continue;
      }
      var input = this.$module.querySelector(`input[name=cookies-${category}][value=${cookies_policy[category] ? "on" : "off"}]`)
      if (input) {
        input.checked = true
      }
    }
  }

  CookieSettings.prototype.getFormValues = function (form) {
    form = (form || this.$module);
    var formInputs = form.getElementsByTagName('input')
    var values = {};

    for (var i = 0; i < formInputs.length; i++) {
      var input = formInputs[i]
      if (input.checked) {
        var name = input.name.replace('cookies-', '')
        var value = input.value === 'on'

        values[name] = value
      }
    }

    values["essential"] = true;

    return values;
  }

  CookieSettings.prototype.submitSettingsForm = function (event) {
    event.preventDefault()
    console.log("cookies page submitted")

    this.cookies_policy = this.getFormValues(event.target);

    console.log("CookieSettings.submitSettingsForm: setting cookies_policy", this.cookies_policy)
    Utils.setCookie("cookies_policy", JSON.stringify(this.cookies_policy), {"days": 365});
    Utils.setCookie('cookies_preferences_set', true, {"days": 365})

    this.showConfirmationMessage()

    return false
  }

  CookieSettings.prototype.showConfirmationMessage = function () {
    var confirmationMessage = document.querySelector('div[data-cookie-confirmation]')
    // hide the message if already visible so assistive tech is triggered when it appears
    confirmationMessage.style.display = 'none'
    var previousPageLink = document.querySelector('.cookie-settings__prev-page')
    var referrer = CookieSettings.prototype.getReferrerLink()

    document.body.scrollTop = document.documentElement.scrollTop = 0

    if (referrer && referrer !== document.location.pathname) {
      previousPageLink.href = referrer
      previousPageLink.style.display = 'inline'
    } else {
      previousPageLink.style.display = 'none'
    }

    confirmationMessage.style.display = 'block'
  }

  CookieSettings.prototype.getReferrerLink = function () {
    return document.referrer ? new URL(document.referrer).pathname : false
  }

  document.addEventListener("DOMContentLoaded", function () {
    var nodes = document.querySelectorAll('[data-module~="cookie-settings"]');
    for (var index = 0; nodes.length > index; index++) {
      new CookieSettings(nodes[index]).init();
    }
  });
})()
