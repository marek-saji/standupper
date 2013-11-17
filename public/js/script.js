(function _bindPlanEvents () {
  'use strict';

  function getPlanContext (element)
  {
    var context = element.parentElement;
    if ('BODY' === context.tagName)
    {
      return null;
    }
    else if (context.classList.contains('plan'))
    {
      return context;
    }
    else
    {
      return getPlanContext(context);
    }
  }

  function savePlanPart (element, value)
  {
    var context = getPlanContext(element),
        name = element.name || element.dataset.name,
        data;

    if (context && name)
    {
      data = { _id: context.id };
      data[ name ] = value;

      req = new XMLHttpRequest();
      req.onload = function () {
        // TODO
      };
      req.onerror = function () {
        // TODO
      };

      req.open('POST', window.location, true);
      req.setRequestHeader('Content-Type', 'application/json');

      req.send( JSON.stringify(data) );
    }
  }

  document.addEventListener('focusout', function (event) {
    if (event.target.classList.contains('planEntries'))
    {
      savePlanPart(event.target, event.target.textContent.trim().split("\n"));
    }
  });

  document.addEventListener('change', function (event) {
    if (event.target.name === 'draft')
    {
      savePlanPart(event.target, event.target.checked);
      getPlanContext(event.target).classList.toggle(event.target.name, event.target.checked);
    }
  });

}());
