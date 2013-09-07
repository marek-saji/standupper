"use strict";

document.addEventListener("focusout", function (event) {
  if (event.target.classList.contains("planEntries"))
  {
    var req = new XMLHttpRequest(),
        context = event.target.parentElement.parentElement, // FIXME
        data = {};
    req.onload = function () {
      // TODO
    };

    req.open("POST", "/plan", true);
    req.setRequestHeader("Content-Type", "application/json");

    data._id = context.id;
    data[ event.target.dataset.name ] = event.target.innerText.trim().split("\n");
    req.send( JSON.stringify(data) );
  }
});