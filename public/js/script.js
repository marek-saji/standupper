(function _bindPlanEvents () {
  'use strict';

  var SAVE_DELAY = 20;

  var socket = window.io && io.connect('/socket/' + window.location.pathname);

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

      socket.emit('save', data);
    }
  }

  document.addEventListener('input', function (event) {
    if (event.target.classList.contains('planEntries'))
    {
      clearTimeout(event.target.dataset.saveTimeout);
      event.target.dataset.saveTimeout = setTimeout(function () {
        savePlanPart(event.target, event.target.textContent.trim().split('\n'));
      }, SAVE_DELAY);
    }
  });

  document.addEventListener('change', function (event) {
    if (event.target.name === 'draft')
    {
      savePlanPart(event.target, event.target.checked);
      getPlanContext(event.target).classList.toggle(event.target.name, event.target.checked);
    }
  });

  if (socket)
  {
    socket.on('update', function (data) {
      var context = document.getElementById(data._id),
          element,
          name;
      for (name in data)
      {
        element = context.querySelector('[name=' + name + '], [data-name=' + name + ']');
        if (!element)
        {
          continue;
        }
        else if ('INPUT' === element.tagName && 'checkbox' === element.type)
        {
          element.checked = data[name];
          context.classList.toggle(name, data[name]);
        }
        else
        {
          element.textContent = data[name].join("\n");
        }
      }
    });
  }


}());
