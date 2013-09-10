var mongoose = require('mongoose'),
    Plan = mongoose.model('Plan'),
    Promise = require('mongoose/lib/promise');

exports.index = function (req, res) {
  Plan.find(function (err, plans) {
    var newPlan;
    if (0 === plans.length) {
      newPlan = new Plan();
      newPlan.save();
      plans.push(newPlan);
    }
    res.render('plan/index', {
      title: 'plan',
      plans: plans,
      user: req.user
    });
  });
};

exports.save = function(req, res) {
  Plan.findById(req.body._id).exec()

    .then(function (foundPlan) {
      var promise = new Promise(),
          plan = (null === foundPlan) ? new Plan() : foundPlan,
          data = req.body;
      delete data._id;
      plan.set(data);
      plan.save(promise.resolve.bind(promise));
      return promise;
    })

    .onFulfill(function (savedPlan) {
      res.json(
        200,
        {
          plan: savedPlan
        }
      );
    })

    .onReject(function (error) {
      res.json(
        500,
        {
          error: error.toString()
        }
      );
      console.error(error.stack);
    });
};