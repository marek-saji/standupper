var mongoose = require('mongoose');

var PlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  },
  date: String,
  draft: { type: Boolean, default: true },
  prev: [String],
  next: [String],
  obst: [String]
});

PlanSchema.pre('save', function (next) {
  var originalDate = this.date;
  this.date = PlanSchema.statics.dateToISODateString(this.date);
  next();
});

PlanSchema.statics.dateToISODateString =  function (date) {
  date = date ? new Date(date) : new Date();
  return date.toISOString().split('T')[0];
};

// TODO add index

mongoose.model('Plan', PlanSchema);