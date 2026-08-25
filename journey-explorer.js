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
})();
