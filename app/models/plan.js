var mongoose = require('mongoose');

var PlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  },
  draft: { type: Boolean, default: true },
  prev: [String],
  next: [String],
  obst: [String]
});

PlanSchema.pre('save', function (next) {
  //this.user = TODO;
  next();
});

PlanSchema.virtual('date')
  .get(function() {
    var date = new Date(this._id.generationTime * 1000);
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDay()
    );
  });

// TODO add index

mongoose.model('Plan', PlanSchema);