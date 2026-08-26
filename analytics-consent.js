(function () {
  'use strict';

  // Add the GA4 Measurement ID here after creating the web data stream.
  var MEASUREMENT_ID = 'G-NC79D1QQ5H';
  var CONSENT_KEY = 'punt_analytics_consent';
  var isEnglish = document.documentElement.lang === 'en';
  var analyticsReady = false;

  var copy = isEnglish ? {
    title: 'Analytics cookies',
    text: 'With your permission, we use Google Analytics to understand which pages and product features are useful. We do not send form fields such as your name, email, or phone number to Analytics.',
    accept: 'Allow analytics',
    reject: 'Reject',
    settings: 'Cookie settings',
    privacy: 'Privacy notice'
  } : {
    title: 'Analitik çerezler',
    text: 'İzninizle, hangi sayfa ve ürün özelliklerinin faydalı olduğunu anlamak için Google Analytics kullanıyoruz. Ad, e-posta ve telefon gibi form bilgilerini Analytics’e göndermiyoruz.',
    accept: 'Analitiğe izin ver',
    reject: 'Reddet',
    settings: 'Çerez tercihleri',
    privacy: 'Gizlilik ve KVKK metni'
  };

  function readConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch (error) { return null; }
  }

  function saveConsent(value) {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch (error) {}
  }

  function safeValue(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 100);
  }

  function track(eventName, parameters) {
    if (!analyticsReady || typeof window.gtag !== 'function') return;
    var safeParameters = {};
    Object.keys(parameters || {}).forEach(function (key) {
      safeParameters[key] = safeValue(parameters[key]);
    });
    window.gtag('event', eventName, safeParameters);
  }

  window.puntTrack = track;

  function loadAnalytics() {
    if (analyticsReady || !/^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID)) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    script.onload = function () {
      window.gtag('js', new Date());
      window.gtag('config', MEASUREMENT_ID, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        send_page_view: true
      });
      analyticsReady = true;
      document.dispatchEvent(new CustomEvent('punt:analytics-ready'));
    };
    document.head.appendChild(script);
  }

  function removeBanner() {
    var banner = document.getElementById('analytics-consent');
    if (banner) banner.remove();
  }

  function chooseConsent(value) {
    saveConsent(value);
    removeBanner();
    if (value === 'granted') loadAnalytics();
  }

  function showBanner() {
    if (document.getElementById('analytics-consent')) return;
    var banner = document.createElement('section');
    banner.id = 'analytics-consent';
    banner.className = 'analytics-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'analytics-consent-title');
    banner.innerHTML =
      '<div class="analytics-consent-copy">' +
        '<strong id="analytics-consent-title">' + copy.title + '</strong>' +
        '<p>' + copy.text + ' <a href="' + (isEnglish ? 'privacy-en.html' : 'privacy.html') + '">' + copy.privacy + '</a></p>' +
      '</div>' +
      '<div class="analytics-consent-actions">' +
        '<button type="button" class="analytics-reject">' + copy.reject + '</button>' +
        '<button type="button" class="analytics-accept">' + copy.accept + '</button>' +
      '</div>';
    document.body.appendChild(banner);
    banner.querySelector('.analytics-accept').addEventListener('click', function () { chooseConsent('granted'); });
    banner.querySelector('.analytics-reject').addEventListener('click', function () { chooseConsent('denied'); });
  }

  function addSettingsControl() {
    var footerLinks = document.querySelector('.site-footer-links');
    if (!footerLinks || footerLinks.querySelector('.analytics-settings')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'analytics-settings';
    button.textContent = copy.settings;
    button.addEventListener('click', showBanner);
    footerLinks.appendChild(button);
  }

  function sectionName(element) {
    var section = element.closest('section[id]');
    return section ? section.id : 'global';
  }

  function bindEvents() {
    document.addEventListener('click', function (event) {
      var target = event.target.closest('a, button');
      if (!target) return;

      if (target.matches('.nav-cta, .hero-primary, .mobile-demo')) {
        track('demo_cta_click', { cta_text: target.textContent, section: sectionName(target) });
      }
      if (target.matches('.product-hotspot')) {
        track('product_feature_view', { feature_name: target.getAttribute('data-title') || target.textContent });
      }
      if (target.matches('.journey-step-trigger')) {
        track('journey_step_view', { step_name: target.textContent });
      }
      if (target.matches('.nav-language a, .lang-switch a')) {
        track('language_switch', { language: target.textContent });
      }

      var href = target.getAttribute('href') || '';
      if (/wa\.me/.test(href)) track('contact_click', { method: 'whatsapp', section: sectionName(target) });
      if (/^tel:/.test(href)) track('contact_click', { method: 'phone', section: sectionName(target) });
      if (/^mailto:/.test(href)) track('contact_click', { method: 'email', section: sectionName(target) });
    });

    var form = document.getElementById('demo-request-form');
    if (form) {
      var formStarted = false;
      form.addEventListener('focusin', function () {
        if (formStarted) return;
        formStarted = true;
        track('form_start', { form_name: 'demo_request' });
      });
    }

    document.addEventListener('punt:lead-success', function () {
      track('generate_lead', { form_name: 'demo_request' });
    });
  }

  function initialize() {
    addSettingsControl();
    bindEvents();
    var consent = readConsent();
    if (consent === 'granted') loadAnalytics();
    else if (consent !== 'denied') showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
