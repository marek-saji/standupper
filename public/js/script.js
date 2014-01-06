function getParentByClassName (className, element)
{
  var context = element.parentElement;
  if ('BODY' === context.tagName)
  {
    return null;
  }
  else if (context.classList.contains(className))
  {
    return context;
  }
  else
  {
    return getParentByClassName(className, context);
  }
}


(function _bindPlanEvents () {

  'use strict';

  var SAVE_DELAY = 20;

  var socket = window.io && window.io.connect('/socket/' + window.location.pathname);

  var getPlanContext = getParentByClassName.bind(null, 'molecule_StandUp');

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
        savePlanPart(event.target, event.target.value.trim().split('\n'));
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

  Array.prototype.forEach.call(
    document.querySelectorAll('.molecule_StandUp input[type=submit]'),
    function (submit) {
      submit.style.display = 'none';
    }
  );

  if (socket)
  {
    var newUsers = [];
    socket.on('update', function (data) {
      var context = document.getElementById(data._id),
          element,
          name;
      if (null === context)
      {
        if (-1 === newUsers.indexOf(data._id))
        {
          newUsers.push(data._id);
          alert('New user arrived in this day. Refresh to reveal.');
        }
        return;
      }

      for (name in data)
      {
        if (data.hasOwnProperty(name))
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
          else if (-1 !== ['INPUT', 'TEXTAREA'].indexOf(element.tagName))
          {
            element.value = data[name].join("\n");
          }
          else
          {
            element.textContent = data[name].join("\n");
          }
        }
      }
    });
  }

}());



Array.prototype.forEach.call(
  document.querySelectorAll('textarea.autoexpandable'),
  function (textarea) {
    var TEXTAREA_AUTOEXPANDABLE_DELAY = 20;

    var clone,
        paddingBottom;

    textarea.style.overflowY = 'hidden';

    clone = textarea.cloneNode();
    clone.disabled = true;
    clone.style.visibility = 'hidden';
    clone.style.position = 'absolute';
    clone.style.left = 0;
    clone.style.height = 'auto';
    textarea.parentNode.insertBefore(clone, textarea.nextSibling);

    // make clone 1em in height
    clone.style.height = '1em';
    clone.style.minHeight = 0;
    clone.style.padding = 0;
    clone.style.margin = 0;
    clone.value = '';
    // store 1em
    paddingBottom = clone.scrollHeight;
    // restore textarea's styles
    clone.style.minHeight = textarea.style.minHeight;
    clone.style.padding = textarea.style.padding;
    clone.style.margin = textarea.style.margin;

    textarea.style.resize = 'none';
    if (textarea.style.transition)
    {
      textarea.style.transition += ', height 0.1s ease-in';
    }
    else
    {
      textarea.style.transition = 'height 0.1s ease-in';
    }

    function delayedFit () {
      var id;
      if (!id)
      {
        id = setTimeout(function () {
          id = null;

          clone.value = textarea.value;
          clone.style.width = textarea.offsetWidth + 'px';
          textarea.style.height = clone.scrollHeight + paddingBottom + 'px';
        }, TEXTAREA_AUTOEXPANDABLE_DELAY);
      }
    }

    delayedFit();
    textarea.addEventListener('input', delayedFit);
    window.addEventListener('resize',  delayedFit);
  }
);



Array.prototype.forEach.call(
  document.querySelectorAll('.molecule_DayChooser'),
  function (context) {
    'use strict';

    var dayChooser = context.querySelector('input[name=date]');

    // give it a delay to allow changing date with a spinner
    dayChooser.addEventListener('change', function () {
      window.location.href = '/plan/' + dayChooser.value;
    });

    context.querySelector('input[type=submit]').style.display = 'none';
  }
);
