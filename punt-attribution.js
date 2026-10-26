// Punt Automation — lead kaynağı yakalama (utm/gclid/fbclid → Cloudflare Worker → BigQuery).
// Formun FormSubmit'e gönderimini değiştirmez; yalnızca bir kopyasını Worker'a yollar.
(function () {
  var WORKER_URL = "https://punt-data-pipeline.kalip-cloud.workers.dev/lead";
  var FORM_SELECTOR = 'form[action*="formsubmit.co"]';
  // Worker alan adı : sitedeki formun input name'i (puntautomationtech.com, Ekim 2026)
  var FIELD_MAP = {
    full_name: "Ad Soyad",
    facility_name: "Fabrika Adi",
    email: "E-posta",
    phone: "Telefon",
    topic: "Talep turu",
    message: "Ihtiyac",
    website: "_honey" // FormSubmit bot tuzağı; doluysa Worker kaydetmez
  };
  var KEY = "punt_attr";
  var TTL = 90 * 24 * 3600 * 1000;

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      return v && v.expires > Date.now() ? v : null;
    } catch (e) { return null; }
  }

  var qs = new URLSearchParams(location.search);
  var params = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  var hasNew = params.some(function (p) { return qs.get(p); });
  var attr = read();

  // Yeni bir kampanya tıklaması eski kaydın üzerine yazar (son tıklama); yoksa ilk kayıt korunur.
  if (!attr || hasNew) {
    attr = { expires: Date.now() + TTL, landing_page: location.href, referrer: document.referrer || null };
    params.forEach(function (p) { attr[p] = qs.get(p); });
    try { localStorage.setItem(KEY, JSON.stringify(attr)); } catch (e) {}
  }

  document.addEventListener("submit", function (ev) {
    var form = ev.target;
    if (!form.matches || !form.matches(FORM_SELECTOR)) return;
    var fd = new FormData(form);
    var payload = { page_url: location.href };
    Object.keys(FIELD_MAP).forEach(function (k) {
      var v = fd.get(FIELD_MAP[k]);
      if (v != null && v !== "") payload[k] = String(v);
    });
    var a = read() || {};
    ["landing_page", "referrer"].concat(params).forEach(function (k) { if (a[k]) payload[k] = a[k]; });

    fetch(WORKER_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {});
  }, true);
})();
