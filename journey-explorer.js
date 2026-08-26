(function () {
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.journey-step-trigger'));
  document.documentElement.classList.add('journey-explorer-ready');

  function closeDetails(exceptTrigger) {
    triggers.forEach(function (trigger) {
      if (trigger === exceptTrigger) return;
      trigger.setAttribute('aria-expanded', 'false');
      var detail = document.getElementById(trigger.getAttribute('aria-controls'));
      if (detail) detail.hidden = true;
    });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var detail = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!detail) return;
      var willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      closeDetails(trigger);
      trigger.setAttribute('aria-expanded', String(willOpen));
      detail.hidden = !willOpen;
    });
  });

  if (!triggers.length) return;

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.journey-card-production')) closeDetails();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var activeTrigger = triggers.filter(function (trigger) {
      return trigger.getAttribute('aria-expanded') === 'true';
    })[0];
    closeDetails();
    if (activeTrigger) activeTrigger.focus();
  });
  var productTriggers = Array.prototype.slice.call(document.querySelectorAll('.product-hotspot'));
  var productTitle = document.getElementById('product-detail-title');
  var productCopy = document.getElementById('product-detail-copy');
  var productData = document.getElementById('product-detail-data');
  productTriggers.forEach(function (trigger) {
    trigger.setAttribute('aria-pressed', String(trigger.classList.contains('is-active')));
    trigger.addEventListener('click', function () {
      productTriggers.forEach(function (item) { var active=item===trigger; item.classList.toggle('is-active',active); item.setAttribute('aria-pressed',String(active)); });
      if(productTitle) productTitle.textContent=trigger.getAttribute('data-title')||'';
      if(productCopy) productCopy.textContent=trigger.getAttribute('data-copy')||'';
      if(productData) productData.textContent=trigger.getAttribute('data-data')||'';
    });
  });
})();
