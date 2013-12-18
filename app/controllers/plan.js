var mongoose = require('mongoose'),
    Plan = mongoose.model('Plan'),
    Promise = require('mongoose/lib/promise');

var io = require('../../js/io')(),
    namespaces = {};

function savePlan(id, data, user_id)
{
  return Plan.findById(id).exec()
    .then(function (foundPlan) {
      var promise = new Promise(),
          plan = (null === foundPlan) ? new Plan() : foundPlan;
      if (data.draft !== undefined) plan.draft = data.draft;
      if (data.prev !== undefined) plan.prev = data.prev;
      if (data.next !== undefined) plan.next = data.next;
      if (data.obst !== undefined) plan.obst = data.obst;
      if (plan.user == user_id)
      {
        plan.save(promise.resolve.bind(promise));
      }
      else
      {
        promise.reject(403);
      }
      return promise;
    });
}

// register corresponding namespace, if does not
// already exist
function registerNamespace (req)
{
  var ns = req.url,
      socket;
  if (namespaces[ns])
  {
    return;
  }

  socket = io.of('/socket/' + ns);

  socket.on('connection', function (socket) {

    socket.on('save', function (data) {
      savePlan(data._id, data, req.user._id).then(function (savedPlan) {
        socket.broadcast.emit('update', savedPlan);
      });
    });

  });

}


exports.index = function (req, res) {
  var date = Plan.dateToISODateString(req.params.date);

  registerNamespace(req);

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
        useSockets:  true,
        title:       'plan',
        date:        date,
        plans:       plans
      });
    })
    .onReject(function (error) {
      res.send(500);
    });
};

// TODO deprecated
exports.save = function(req, res) {
  var data = {
    draft: req.body.draft,
    prev: req.body.prev.split("\n"),
    next: req.body.next.split("\n"),
    obst: req.body.obst.split("\n")
  };
  savePlan(req.body._id, data, req.user._id).then(
    function (savedPlan) {
      res.redirect(req.url);
    },
    function (error) {
      res.status(403);
      console.error(error);
    }
  );
};
