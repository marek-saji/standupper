module.exports = function(app){

	//main route
	var main = require('../app/controllers/main');
	app.get('/', main.index);

  var plan = require('../app/controllers/plan');
  app.get('/plan', plan.index);
  app.post('/plan', plan.save);

};
