var mongoose = require('mongoose'),
    Plan = mongoose.model('Plan'),
    Promise = require('mongoose/lib/promise');

exports.index = function (req, res) {
  var date = Plan.dateToISODateString(req.params.date);
  Plan.find().where('date').equals(date)
    .populate('user')
    .exec()
    .then(function (plans) {
      var promise = new Promise(),
          hasMyPlan,
          myPlan;
      hasMyPlan = plans.some(function (plan) {
        return plan.user._id == req.user._id;
      });
      if (false === hasMyPlan) {
        // TODO add on demand
        myPlan = new Plan();
        myPlan.user = req.user._id;
        myPlan.date = date;
        myPlan.save();
        myPlan.populate('user', function (plan) {
          plans.push(myPlan);
          promise.fulfill(plans);
        });
      }
      else
      {
        promise.fulfill(plans);
      }

      return promise;
    })
    .onFulfill(function (plans) {
      plans = plans.sort(function (a, b) {
        if (a.user._id == req.user._id)
        {
          return -1;
        }
        else if (b.user._id == req.user._id)
        {
          return +1;
        }
        else
        {
          return a.user._id < b.user._id ? -1 : a.user._id > b.user._id;
        }
      });
      res.render('plan/index', {
        title: 'plan',
        plans: plans
      });
    })
    .onReject(function (error) {
      res.send(500);
    });
};

exports.save = function(req, res) {
  Plan.findById(req.body._id).exec()

    .then(function (foundPlan) {
      var promise = new Promise(),
          plan = (null === foundPlan) ? new Plan() : foundPlan,
          data = req.body;
      delete data._id;
      delete data.user;
      delete data.date;
      plan.set(data);
      if (plan.user == req.user._id)
      {
        plan.save(promise.resolve.bind(promise));
      }
      else
      {
        promise.reject(403);
      }
      return promise;
    })

    .then(
      function (savedPlan) {
        res.json(
          200,
          {
            plan: savedPlan
          }
        );
      },
      function (error) {
        var httpCode = 500;
        if (error === ~~error)
        {
          httpCode = error;
        }
        res.json(
          httpCode,
          {
            error: error.toString()
          }
        );
        console.error(error.stack);
      }
    );
};
